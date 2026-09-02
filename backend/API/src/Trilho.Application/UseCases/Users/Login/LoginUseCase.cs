using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Users;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Security.Tokens;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Users.Login;
public class LoginUseCase : ILoginUseCase
{
    private readonly IUserReadOnlyRepository _repository;
    private readonly IPasswordEncripter _passwordEncripter;
    private readonly IAcessTokenGenerator _accessTokenGenerator;

    public LoginUseCase(IUserReadOnlyRepository repository, IPasswordEncripter passwordEncripter, IAcessTokenGenerator accessTokenGenerator)
    {
        _repository = repository;
        _passwordEncripter = passwordEncripter;
        _accessTokenGenerator = accessTokenGenerator;
    }

    public async Task<ResponseUserLoginJson> Execute(RequestUserLoginJson request)
    {
        var user = await _repository.GetUserByEmail(request.Email);

        if (user is null)
        {
            throw new InvalidLoginException();
        }

        var passwordMatch = _passwordEncripter.Verify(request.Password, user.Password);

        if (passwordMatch == false)
        {
            throw new InvalidLoginException();
        }

        return new ResponseUserLoginJson
        {
            Name = user.Name,
            Token = _accessTokenGenerator.Generate(user)
        };
    }
}
