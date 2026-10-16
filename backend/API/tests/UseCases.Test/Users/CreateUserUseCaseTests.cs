using AutoMapper;
using CommonTestUtilities.Requests;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Trilho.Application.AutoMapper;
using Trilho.Application.UseCases.Users.Create;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace UseCases.Test.Users;
public class CreateUserUseCaseTests
{
    private readonly Mock<IUserReadOnlyRepository> _readRepository = new();
    private readonly Mock<IUserWriteOnlyRepository> _writeRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IPasswordEncripter> _passwordEncripter = new();

    private CreateUserUseCase CreateUseCase()
    {
        var mapper = new MapperConfiguration(cfg => cfg.AddProfile<AutoMapping>(), NullLoggerFactory.Instance).CreateMapper();

        _passwordEncripter.Setup(p => p.Encrypt(It.IsAny<string>())).Returns("hash");

        return new CreateUserUseCase(_readRepository.Object, mapper, _passwordEncripter.Object, _unitOfWork.Object, _writeRepository.Object);
    }

    [Fact]
    public async Task Success_PersistsUserWithHashedPasswordAndCommits()
    {
        var request = RequestUserJsonBuilder.Build();

        var response = await CreateUseCase().Execute(request);

        Assert.Equal(request.Email, response.Email);
        _writeRepository.Verify(r => r.Create(It.Is<User>(u => u.Password == "hash" && u.IsActive)), Times.Once);
        _unitOfWork.Verify(u => u.Commit(), Times.Once);
    }

    [Fact]
    public async Task Error_EmailAlreadyRegistered_ReturnsSpecificMessage()
    {
        var request = RequestUserJsonBuilder.Build();
        _readRepository.Setup(r => r.ExistsUserWithEmail(request.Email, It.IsAny<long?>())).ReturnsAsync(true);

        var exception = await Assert.ThrowsAsync<ErrorOnValidationException>(() => CreateUseCase().Execute(request));

        Assert.Contains(ResourceErrorsMessage.EMAIL_ALREADY_REGISTERED, exception.GetErrors());
        _writeRepository.Verify(r => r.Create(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Error_InvalidRole_ReturnsRoleInvalidMessage()
    {
        var request = RequestUserJsonBuilder.Build(role: "superuser");

        var exception = await Assert.ThrowsAsync<ErrorOnValidationException>(() => CreateUseCase().Execute(request));

        Assert.Contains(ResourceErrorsMessage.ROLE_INVALID, exception.GetErrors());
    }

    [Fact]
    public async Task Error_EmptyRole_ReturnsRoleRequiredMessage()
    {
        var request = RequestUserJsonBuilder.Build(role: string.Empty);

        var exception = await Assert.ThrowsAsync<ErrorOnValidationException>(() => CreateUseCase().Execute(request));

        Assert.Contains(ResourceErrorsMessage.ROLE_REQUIRED, exception.GetErrors());
    }

    [Fact]
    public async Task Email_IsNormalizedBeforeLookup()
    {
        var request = RequestUserJsonBuilder.Build(email: "  Mixed.Case@Trilho.Test ");

        await CreateUseCase().Execute(request);

        _readRepository.Verify(r => r.ExistsUserWithEmail("mixed.case@trilho.test", It.IsAny<long?>()), Times.Once);
    }
}
