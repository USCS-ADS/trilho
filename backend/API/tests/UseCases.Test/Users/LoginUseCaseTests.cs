using CommonTestUtilities.Entities;
using Moq;
using Trilho.Application.UseCases.Users.Login;
using Trilho.Communication.Requests.Users;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Security.Tokens;
using Trilho.Domain.Services.Settings;
using Trilho.Exception.ExceptionBase;

namespace UseCases.Test.Users;
public class LoginUseCaseTests
{
    private static readonly DateTimeOffset Now = new(2026, 10, 17, 12, 0, 0, TimeSpan.Zero);

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    private readonly Mock<IUserReadOnlyRepository> _repository = new();
    private readonly Mock<IUserUpdateOnlyRepository> _updateRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IPasswordEncripter> _passwordEncripter = new();
    private readonly Mock<IAcessTokenGenerator> _tokenGenerator = new();
    private readonly Mock<IAuthFlowSettings> _settings = new();

    private LoginUseCase CreateUseCase(User? user, bool passwordMatches = true)
    {
        _repository.Setup(r => r.GetUserByEmail(It.IsAny<string>())).ReturnsAsync(user);
        if (user is not null)
        {
            _updateRepository.Setup(r => r.GetById(user.Id)).ReturnsAsync(user);
        }

        _passwordEncripter.Setup(p => p.Verify(It.IsAny<string>(), It.IsAny<string>())).Returns(passwordMatches);
        _tokenGenerator.Setup(t => t.Generate(It.IsAny<User>())).Returns("token");
        _settings.Setup(s => s.LoginMaxFailedAttempts).Returns(3);
        _settings.Setup(s => s.LoginLockoutMinutes).Returns(15);

        return new LoginUseCase(
            _repository.Object,
            _updateRepository.Object,
            _unitOfWork.Object,
            _passwordEncripter.Object,
            _tokenGenerator.Object,
            _settings.Object,
            new FixedTimeProvider(Now));
    }

    private static RequestUserLoginJson Request(string email = "user@trilho.test") => new() { Email = email, Password = "any" };

    [Fact]
    public async Task Success_ReturnsToken()
    {
        var user = UserBuilder.Build();

        var response = await CreateUseCase(user).Execute(Request(user.Email));

        Assert.Equal("token", response.Token);
        Assert.Equal(user.Name, response.Name);
        _unitOfWork.Verify(u => u.Commit(), Times.Never);
    }

    [Fact]
    public async Task Error_UnknownEmail_IsInvalidLogin()
    {
        await Assert.ThrowsAsync<InvalidLoginException>(() => CreateUseCase(null).Execute(Request()));
        _unitOfWork.Verify(u => u.Commit(), Times.Never);
    }

    [Fact]
    public async Task Error_WrongPassword_IsInvalidLogin_AndCountsTheFailure()
    {
        var user = UserBuilder.Build();

        await Assert.ThrowsAsync<InvalidLoginException>(() => CreateUseCase(user, passwordMatches: false).Execute(Request(user.Email)));

        Assert.Equal(1, user.FailedLoginAttempts);
        Assert.Null(user.LockoutEnd);
        _unitOfWork.Verify(u => u.Commit(), Times.Once);
    }

    [Fact]
    public async Task Error_InactiveUser_IsInvalidLogin()
    {
        var user = UserBuilder.Build(isActive: false);

        await Assert.ThrowsAsync<InvalidLoginException>(() => CreateUseCase(user).Execute(Request(user.Email)));
    }

    [Fact]
    public async Task Lockout_AfterMaxFailures_LocksTheAccount()
    {
        var user = UserBuilder.Build();
        user.FailedLoginAttempts = 2;

        await Assert.ThrowsAsync<InvalidLoginException>(() => CreateUseCase(user, passwordMatches: false).Execute(Request(user.Email)));

        Assert.Equal(0, user.FailedLoginAttempts);
        Assert.Equal(Now.UtcDateTime.AddMinutes(15), user.LockoutEnd);
    }

    [Fact]
    public async Task Lockout_WhileLocked_RejectsEvenTheRightPassword_WithoutCheckingIt()
    {
        var user = UserBuilder.Build();
        user.LockoutEnd = Now.UtcDateTime.AddMinutes(5);

        await Assert.ThrowsAsync<LoginLockedException>(() => CreateUseCase(user).Execute(Request(user.Email)));

        _passwordEncripter.Verify(p => p.Verify(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        _unitOfWork.Verify(u => u.Commit(), Times.Never);
    }

    [Fact]
    public async Task Lockout_AfterItExpires_AllowsLoginAndClearsTheState()
    {
        var user = UserBuilder.Build();
        user.LockoutEnd = Now.UtcDateTime.AddMinutes(-1);
        user.FailedLoginAttempts = 1;

        var response = await CreateUseCase(user).Execute(Request(user.Email));

        Assert.Equal("token", response.Token);
        Assert.Equal(0, user.FailedLoginAttempts);
        Assert.Null(user.LockoutEnd);
        _unitOfWork.Verify(u => u.Commit(), Times.Once);
    }

    [Fact]
    public async Task Success_AfterSomeFailures_ResetsTheCounter()
    {
        var user = UserBuilder.Build();
        user.FailedLoginAttempts = 2;

        await CreateUseCase(user).Execute(Request(user.Email));

        Assert.Equal(0, user.FailedLoginAttempts);
    }
}
