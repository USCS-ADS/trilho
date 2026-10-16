using AutoMapper;
using CommonTestUtilities.Entities;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Trilho.Application.AutoMapper;
using Trilho.Application.UseCases.Teams.AddMember;
using Trilho.Application.UseCases.Teams.ChangeLeader;
using Trilho.Application.UseCases.Teams.Create;
using Trilho.Application.UseCases.Teams.RemoveMember;
using Trilho.Application.UseCases.Teams.Restore;
using Trilho.Application.UseCases.Teams.Shared;
using Trilho.Application.UseCases.Teams.Update;
using Trilho.Communication.Requests.Teams;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace UseCases.Test.Teams;
public class TeamUseCasesTests
{
    private readonly Mock<ITeamReadOnlyRepository> _teamRead = new();
    private readonly Mock<ITeamUpdateOnlyRepository> _teamUpdate = new();
    private readonly Mock<ITeamWriteOnlyRepository> _teamWrite = new();
    private readonly Mock<IUserReadOnlyRepository> _userRead = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<ILoggedUser> _loggedUser = new();

    private static Team BuildTeam(User leader, bool archived = false, params User[] extraMembers)
    {
        var team = new Team { Id = 10, Name = "Backend", LeaderId = leader.Id, IsArchived = archived };
        team.Members.Add(new TeamMember { TeamId = team.Id, UserId = leader.Id, User = leader });

        foreach (var member in extraMembers)
        {
            team.Members.Add(new TeamMember { TeamId = team.Id, UserId = member.Id, User = member });
        }

        return team;
    }

    private TeamLeaderGuard Guard() => new(_userRead.Object, _teamRead.Object);

    private void LoggedAs(User user) => _loggedUser.Setup(l => l.User()).ReturnsAsync(user);

    // ---- Create

    [Fact]
    public async Task Create_ValidRequest_AddsLeaderAsMemberAndCommits()
    {
        var admin = UserBuilder.Build(Roles.ADMIN);
        var leader = UserBuilder.Build(Roles.LEADER);
        _userRead.Setup(r => r.GetById(leader.Id)).ReturnsAsync(leader);
        var mapper = new MapperConfiguration(cfg => cfg.AddProfile<AutoMapping>(), NullLoggerFactory.Instance).CreateMapper();
        LoggedAs(admin);

        Team? created = null;
        _teamWrite.Setup(r => r.Create(It.IsAny<Team>())).Callback<Team>(t => created = t).Returns(Task.CompletedTask);
        _teamRead.Setup(r => r.GetById(It.IsAny<long>())).ReturnsAsync(() => created);

        var useCase = new CreateTeamUseCase(_teamWrite.Object, _teamRead.Object, Guard(), _unitOfWork.Object, mapper);

        await useCase.Execute(new RequestTeamJson { Name = "  Backend ", Description = "APIs", LeaderId = leader.Id });

        Assert.NotNull(created);
        Assert.Equal("Backend", created!.Name);
        Assert.Single(created.Members, m => m.UserId == leader.Id);
        _unitOfWork.Verify(u => u.Commit(), Times.Once);
    }

    [Fact]
    public async Task Create_DuplicateName_IsRejected()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        _teamRead.Setup(r => r.ExistsTeamWithName("Backend", It.IsAny<long?>())).ReturnsAsync(true);
        var useCase = new CreateTeamUseCase(_teamWrite.Object, _teamRead.Object, Guard(), _unitOfWork.Object, Mock.Of<IMapper>());

        var exception = await Assert.ThrowsAsync<ErrorOnValidationException>(() =>
            useCase.Execute(new RequestTeamJson { Name = "Backend", LeaderId = leader.Id }));

        Assert.Contains(ResourceErrorsMessage.TEAM_NAME_ALREADY_EXISTS, exception.GetErrors());
    }

    [Fact]
    public async Task Create_LeaderWithMemberRole_IsRejected()
    {
        var member = UserBuilder.Build(Roles.USER);
        _userRead.Setup(r => r.GetById(member.Id)).ReturnsAsync(member);
        var useCase = new CreateTeamUseCase(_teamWrite.Object, _teamRead.Object, Guard(), _unitOfWork.Object, Mock.Of<IMapper>());

        var exception = await Assert.ThrowsAsync<ErrorOnValidationException>(() =>
            useCase.Execute(new RequestTeamJson { Name = "Dados", LeaderId = member.Id }));

        Assert.Contains(ResourceErrorsMessage.TEAM_LEADER_INVALID_ROLE, exception.GetErrors());
    }

    [Fact]
    public async Task Create_LeaderAlreadyLeadingActiveTeam_IsConflict()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        _userRead.Setup(r => r.GetById(leader.Id)).ReturnsAsync(leader);
        _teamRead.Setup(r => r.ExistsTeamLedBy(leader.Id, null, true)).ReturnsAsync(true);
        var useCase = new CreateTeamUseCase(_teamWrite.Object, _teamRead.Object, Guard(), _unitOfWork.Object, Mock.Of<IMapper>());

        await Assert.ThrowsAsync<ConflictException>(() =>
            useCase.Execute(new RequestTeamJson { Name = "Dados", LeaderId = leader.Id }));
        _unitOfWork.Verify(u => u.Commit(), Times.Never);
    }

    // ---- Update

    [Fact]
    public async Task Update_OtherTeamsLeader_IsForbidden()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        var stranger = UserBuilder.Build(Roles.LEADER);
        _teamUpdate.Setup(r => r.GetById(10)).ReturnsAsync(BuildTeam(leader));
        LoggedAs(stranger);
        var useCase = new UpdateTeamUseCase(_teamUpdate.Object, _teamRead.Object, _loggedUser.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            useCase.Execute(10, new RequestUpdateTeamJson { Name = "Novo" }));
    }

    [Fact]
    public async Task Update_ArchivedTeam_IsConflict()
    {
        var admin = UserBuilder.Build(Roles.ADMIN);
        _teamUpdate.Setup(r => r.GetById(10)).ReturnsAsync(BuildTeam(UserBuilder.Build(Roles.LEADER), archived: true));
        LoggedAs(admin);
        var useCase = new UpdateTeamUseCase(_teamUpdate.Object, _teamRead.Object, _loggedUser.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<ConflictException>(() =>
            useCase.Execute(10, new RequestUpdateTeamJson { Name = "Novo" }));
    }

    // ---- Members

    [Fact]
    public async Task AddMember_AlreadyMember_IsConflict()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        var member = UserBuilder.Build(Roles.USER);
        _teamUpdate.Setup(r => r.GetById(10)).ReturnsAsync(BuildTeam(leader, false, member));
        _userRead.Setup(r => r.GetById(member.Id)).ReturnsAsync(member);
        LoggedAs(leader);
        var useCase = new AddTeamMemberUseCase(_teamUpdate.Object, _userRead.Object, _loggedUser.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<ConflictException>(() =>
            useCase.Execute(10, new RequestTeamMemberJson { UserId = member.Id }));
    }

    [Fact]
    public async Task AddMember_NewUser_IsAddedAndCommitted()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        var newcomer = UserBuilder.Build(Roles.USER);
        var team = BuildTeam(leader);
        _teamUpdate.Setup(r => r.GetById(10)).ReturnsAsync(team);
        _userRead.Setup(r => r.GetById(newcomer.Id)).ReturnsAsync(newcomer);
        LoggedAs(leader);
        var useCase = new AddTeamMemberUseCase(_teamUpdate.Object, _userRead.Object, _loggedUser.Object, _unitOfWork.Object);

        await useCase.Execute(10, new RequestTeamMemberJson { UserId = newcomer.Id });

        Assert.True(team.HasMember(newcomer.Id));
        _unitOfWork.Verify(u => u.Commit(), Times.Once);
    }

    [Fact]
    public async Task RemoveMember_Leader_IsConflict()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        _teamUpdate.Setup(r => r.GetById(10)).ReturnsAsync(BuildTeam(leader));
        LoggedAs(leader);
        var useCase = new RemoveTeamMemberUseCase(_teamUpdate.Object, _loggedUser.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<ConflictException>(() => useCase.Execute(10, leader.Id));
    }

    [Fact]
    public async Task RemoveMember_NotAMember_IsNotFound()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        _teamUpdate.Setup(r => r.GetById(10)).ReturnsAsync(BuildTeam(leader));
        LoggedAs(leader);
        var useCase = new RemoveTeamMemberUseCase(_teamUpdate.Object, _loggedUser.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<NotFoundException>(() => useCase.Execute(10, 9999));
    }

    // ---- Leader / restore

    [Fact]
    public async Task ChangeLeader_NewLeaderBecomesMember_AndOldOneStays()
    {
        var oldLeader = UserBuilder.Build(Roles.LEADER);
        var newLeader = UserBuilder.Build(Roles.LEADER);
        var team = BuildTeam(oldLeader);
        _teamUpdate.Setup(r => r.GetById(10)).ReturnsAsync(team);
        _userRead.Setup(r => r.GetById(newLeader.Id)).ReturnsAsync(newLeader);
        var useCase = new ChangeTeamLeaderUseCase(_teamUpdate.Object, Guard(), _unitOfWork.Object);

        await useCase.Execute(10, new RequestChangeLeaderJson { LeaderId = newLeader.Id });

        Assert.Equal(newLeader.Id, team.LeaderId);
        Assert.True(team.HasMember(newLeader.Id));
        Assert.True(team.HasMember(oldLeader.Id));
        _unitOfWork.Verify(u => u.Commit(), Times.Once);
    }

    [Fact]
    public async Task Restore_WhenLeaderLeadsAnotherActiveTeam_IsConflict()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        _teamUpdate.Setup(r => r.GetById(10)).ReturnsAsync(BuildTeam(leader, archived: true));
        _teamRead.Setup(r => r.ExistsTeamLedBy(leader.Id, 10, true)).ReturnsAsync(true);
        var useCase = new RestoreTeamUseCase(_teamUpdate.Object, _teamRead.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<ConflictException>(() => useCase.Execute(10));
        _unitOfWork.Verify(u => u.Commit(), Times.Never);
    }
}
