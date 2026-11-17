using Trilho.Communication.Requests.Users;

namespace Trilho.Application.UseCases.Users.SetStatus;
public interface ISetUserStatusUseCase
{
    Task Execute(long id, RequestUserStatusJson request);
}
