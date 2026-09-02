using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Users;

namespace Trilho.Application.UseCases.Users.Create;
public interface ICreateUserUseCase
{
    Task<ResponseUserJson> Execute(RequestUserJson request);
}
