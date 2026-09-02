using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Users;

namespace Trilho.Application.UseCases.Users.Login;
public interface ILoginUseCase
{
    Task<ResponseUserLoginJson> Execute(RequestUserLoginJson request);
}
