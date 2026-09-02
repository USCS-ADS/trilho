using Trilho.Communication.Requests.Users;

namespace Trilho.Application.UseCases.Users.Update;
public interface IUpdateUserUseCase
{
    Task Execute(long id, RequestUserJson request);
}
