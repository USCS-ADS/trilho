using CommonTestUtilities.Entities;
using Moq;
using Trilho.Application.UseCases.Users.ChangePassword;
using Trilho.Application.UseCases.Users.SetStatus;
using Trilho.Communication.Requests.Users;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception.ExceptionBase;

namespace UseCases.Test.Users;
public class ChangePasswordAndStatusUseCaseTests
{
    private readonly Mock<IUserUpdateOnlyRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IPasswordEncripter> _passwordEncripter = new();
    private readonly Mock<ILoggedUser> _loggedUser = new();
    private readonly Mock<ITeamReadOnlyRepository> _teamRepository = new();

    private ChangePasswordUseCase CreateChangePassword(Trilho.Domain.Entities.User user)
    {
        _loggedUser.Setup(l => l.User()).ReturnsAsync(user);
        _repository.Setup(r => r.GetById(user.Id)).ReturnsAsync(user);

        return new ChangePasswordUseCase(_repository.Object, _passwordEncripter.Object, _unitOfWork.Object, _loggedUser.Object);
    }

    private SetUserStatusUseCase CreateSetStatus(Trilho.Domain.Entities.User loggedUser)
    {
        _loggedUser.Setup(l => l.User()).ReturnsAsync(loggedUser);

        return new SetUserStatusUseCase(_repository.Object, _unitOfWork.Object, _loggedUser.Object, _teamRepository.Object);
    }

    [Fact]
    public async Task ChangePassword_WithCorrectCurrentPassword_UpdatesHash()
    {
        var user = UserBuilder.Build();
        _passwordEncripter.Setup(p => p.Verify("Old@1234", user.Password)).Returns(true);
        _passwordEncripter.Setup(p => p.Encrypt("New@1234")).Returns("new-hash");

        await CreateChangePassword(user).Execute(new RequestChangePasswordJson { CurrentPassword = "Old@1234", NewPassword = "New@1234" });

        Assert.Equal("new-hash", user.Password);
        _unitOfWork.Verify(u => u.Commit(), Times.Once);
    }

    [Fact]
    public async Task ChangePassword_WithWrongCurrentPassword_IsRejected()
    {
        var user = UserBuilder.Build();
        _passwordEncripter.Setup(p => p.Verify(It.IsAny<string>(), user.Password)).Returns(false);

        var exception = await Assert.ThrowsAsync<ErrorOnValidationException>(() =>
            CreateChangePassword(user).Execute(new RequestChangePasswordJson { CurrentPassword = "Wrong@1234", NewPassword = "New@1234" }));

        Assert.Single(exception.GetErrors());
        _unitOfWork.Verify(u => u.Commit(), Times.Never);
    }

    [Fact]
    public async Task ChangePassword_WithWeakNewPassword_IsRejectedBeforeCheckingCurrent()
    {
        var user = UserBuilder.Build();

        await Assert.ThrowsAsync<ErrorOnValidationException>(() =>
            CreateChangePassword(user).Execute(new RequestChangePasswordJson { CurrentPassword = "Old@1234", NewPassword = "weak" }));

        _passwordEncripter.Verify(p => p.Verify(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        _unitOfWork.Verify(u => u.Commit(), Times.Never);
    }

    [Fact]
    public async Task SetStatus_AdminDeactivatesMember_Succeeds()
    {
        var admin = UserBuilder.Build(Roles.ADMIN);
        var target = UserBuilder.Build();
        _repository.Setup(r => r.GetById(target.Id)).ReturnsAsync(target);

        await CreateSetStatus(admin).Execute(target.Id, new RequestUserStatusJson { IsActive = false });

        Assert.False(target.IsActive);
        _unitOfWork.Verify(u => u.Commit(), Times.Once);
    }

    [Fact]
    public async Task SetStatus_Reactivate_Succeeds()
    {
        var admin = UserBuilder.Build(Roles.ADMIN);
        var target = UserBuilder.Build(isActive: false);
        _repository.Setup(r => r.GetById(target.Id)).ReturnsAsync(target);

        await CreateSetStatus(admin).Execute(target.Id, new RequestUserStatusJson { IsActive = true });

        Assert.True(target.IsActive);
    }

    [Fact]
    public async Task SetStatus_DeactivatingYourself_IsConflict()
    {
        var admin = UserBuilder.Build(Roles.ADMIN);
        _repository.Setup(r => r.GetById(admin.Id)).ReturnsAsync(admin);

        await Assert.ThrowsAsync<ConflictException>(() => CreateSetStatus(admin).Execute(admin.Id, new RequestUserStatusJson { IsActive = false }));

        Assert.True(admin.IsActive);
    }

    [Fact]
    public async Task SetStatus_DeactivatingTeamLeader_IsConflict()
    {
        var admin = UserBuilder.Build(Roles.ADMIN);
        var leader = UserBuilder.Build(Roles.LEADER);
        _repository.Setup(r => r.GetById(leader.Id)).ReturnsAsync(leader);
        _teamRepository.Setup(t => t.ExistsTeamLedBy(leader.Id, null, false)).ReturnsAsync(true);

        await Assert.ThrowsAsync<ConflictException>(() => CreateSetStatus(admin).Execute(leader.Id, new RequestUserStatusJson { IsActive = false }));

        Assert.True(leader.IsActive);
        _unitOfWork.Verify(u => u.Commit(), Times.Never);
    }

    [Fact]
    public async Task SetStatus_UnknownUser_IsNotFound()
    {
        var admin = UserBuilder.Build(Roles.ADMIN);
        _repository.Setup(r => r.GetById(9999)).ReturnsAsync((Trilho.Domain.Entities.User?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => CreateSetStatus(admin).Execute(9999, new RequestUserStatusJson { IsActive = false }));
    }
}
