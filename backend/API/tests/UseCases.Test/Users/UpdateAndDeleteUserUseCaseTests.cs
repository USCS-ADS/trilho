using CommonTestUtilities.Entities;
using CommonTestUtilities.Requests;
using Moq;
using Trilho.Application.UseCases.Users.Delete;
using Trilho.Application.UseCases.Users.Update;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception.ExceptionBase;

namespace UseCases.Test.Users;
public class UpdateAndDeleteUserUseCaseTests
{
    private readonly Mock<IUserUpdateOnlyRepository> _updateRepository = new();
    private readonly Mock<IUserReadOnlyRepository> _readRepository = new();
    private readonly Mock<IUserWriteOnlyRepository> _writeRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IPasswordEncripter> _passwordEncripter = new();
    private readonly Mock<ILoggedUser> _loggedUser = new();
    private readonly Mock<ITeamReadOnlyRepository> _teamRepository = new();

    private UpdateUserUseCase CreateUpdate(User loggedUser)
    {
        _loggedUser.Setup(l => l.User()).ReturnsAsync(loggedUser);

        return new UpdateUserUseCase(_passwordEncripter.Object, _unitOfWork.Object, _updateRepository.Object, _readRepository.Object, _loggedUser.Object, _teamRepository.Object);
    }

    private DeleteUserUseCase CreateDelete(User loggedUser)
    {
        _loggedUser.Setup(l => l.User()).ReturnsAsync(loggedUser);

        return new DeleteUserUseCase(_writeRepository.Object, _unitOfWork.Object, _loggedUser.Object, _teamRepository.Object);
    }

    [Fact]
    public async Task Update_MemberEditingAnotherUser_IsForbidden()
    {
        var member = UserBuilder.Build(Roles.USER);
        var target = UserBuilder.Build(Roles.USER);

        var useCase = CreateUpdate(member);

        await Assert.ThrowsAsync<ForbiddenException>(() => useCase.Execute(target.Id, RequestUserJsonBuilder.Build()));
        _unitOfWork.Verify(u => u.Commit(), Times.Never);
    }

    [Fact]
    public async Task Update_MemberChangingOwnRole_IsForbidden()
    {
        var member = UserBuilder.Build(Roles.USER);
        _updateRepository.Setup(r => r.GetById(member.Id)).ReturnsAsync(member);

        var useCase = CreateUpdate(member);

        await Assert.ThrowsAsync<ForbiddenException>(() => useCase.Execute(member.Id, RequestUserJsonBuilder.Build(Roles.ADMIN)));
    }

    [Fact]
    public async Task Update_AdminChangingAnotherUsersRole_Succeeds()
    {
        var admin = UserBuilder.Build(Roles.ADMIN);
        var target = UserBuilder.Build(Roles.USER);
        _updateRepository.Setup(r => r.GetById(target.Id)).ReturnsAsync(target);

        var useCase = CreateUpdate(admin);

        await useCase.Execute(target.Id, RequestUserJsonBuilder.Build(Roles.LEADER));

        Assert.Equal(Roles.LEADER, target.Role);
        _unitOfWork.Verify(u => u.Commit(), Times.Once);
    }

    [Fact]
    public async Task Update_EmailBelongingToAnotherUser_IsRejected()
    {
        var admin = UserBuilder.Build(Roles.ADMIN);
        var target = UserBuilder.Build(Roles.USER);
        var request = RequestUserJsonBuilder.Build();
        _readRepository.Setup(r => r.ExistsUserWithEmail(request.Email, target.Id)).ReturnsAsync(true);

        var useCase = CreateUpdate(admin);

        await Assert.ThrowsAsync<ErrorOnValidationException>(() => useCase.Execute(target.Id, request));
    }

    [Fact]
    public async Task Delete_Yourself_IsConflict()
    {
        var admin = UserBuilder.Build(Roles.ADMIN);

        var useCase = CreateDelete(admin);

        await Assert.ThrowsAsync<ConflictException>(() => useCase.Execute(admin.Id));
        _writeRepository.Verify(r => r.Delete(It.IsAny<long>()), Times.Never);
    }

    [Fact]
    public async Task Delete_UnknownUser_IsNotFound()
    {
        var admin = UserBuilder.Build(Roles.ADMIN);
        _writeRepository.Setup(r => r.Delete(999)).ReturnsAsync(false);

        var useCase = CreateDelete(admin);

        await Assert.ThrowsAsync<NotFoundException>(() => useCase.Execute(999));
    }
}
