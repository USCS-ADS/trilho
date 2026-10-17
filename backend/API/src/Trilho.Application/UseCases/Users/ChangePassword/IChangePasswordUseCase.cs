using Trilho.Communication.Requests.Users;

namespace Trilho.Application.UseCases.Users.ChangePassword;
public interface IChangePasswordUseCase
{
    Task Execute(RequestChangePasswordJson request);
}
