using CommonTestUtilities.Entities;
using Moq;
using Trilho.Application.UseCases.Users.Login;
using Trilho.Communication.Requests.Users;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Security.Tokens;
using Trilho.Exception.ExceptionBase;

namespace UseCases.Test.Users;
public class LoginUseCaseTests
{
    private readonly Mock<IUserReadOnlyRepository> _repository = new();
    private readonly Mock<IPasswordEncripter> _passwordEncripter = new();
    private readonly Mock<IAcessTokenGenerator> _tokenGenerator = new();

    private LoginUseCase CreateUseCase(User? user, bool passwordMatches = true)
    {
        _repository.Setup(r => r.GetUserByEmail(It.IsAny<string>())).ReturnsAsync(user);
        _passwordEncripter.Setup(p => p.Verify(It.IsAny<string>(), It.IsAny<string>())).Returns(passwordMatches);
        _tokenGenerator.Setup(t => t.Generate(It.IsAny<User>())).Returns("token");

        return new LoginUseCase(_repository.Object, _passwordEncripter.Object, _tokenGenerator.Object);
    }

    private static RequestUserLoginJson Request(string email = "user@trilho.test") => new() { Email = email, Password = "any" };

    [Fact]
    public async Task Success_ReturnsToken()
    {
        var user = UserBuilder.Build();

        var response = await CreateUseCase(user).Execute(Request(user.Email));

        Assert.Equal("token", response.Token);
        Assert.Equal(user.Name, response.Name);
    }

    [Fact]
    public async Task Error_UnknownEmail_IsInvalidLogin()
    {
        await Assert.ThrowsAsync<InvalidLoginException>(() => CreateUseCase(null).Execute(Request()));
    }

    [Fact]
    public async Task Error_WrongPassword_IsInvalidLogin()
    {
        var user = UserBuilder.Build();

        await Assert.ThrowsAsync<InvalidLoginException>(() => CreateUseCase(user, passwordMatches: false).Execute(Request(user.Email)));
    }

    [Fact]
    public async Task Error_InactiveUser_IsInvalidLogin()
    {
        var user = UserBuilder.Build(isActive: false);

        await Assert.ThrowsAsync<InvalidLoginException>(() => CreateUseCase(user).Execute(Request(user.Email)));
    }
}
