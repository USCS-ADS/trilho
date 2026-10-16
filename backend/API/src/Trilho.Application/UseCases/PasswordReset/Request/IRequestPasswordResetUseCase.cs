using Trilho.Communication.Requests.PasswordReset;

namespace Trilho.Application.UseCases.PasswordReset.Request;
public interface IRequestPasswordResetUseCase
{
    Task Execute(RequestPasswordResetJson request);
}
