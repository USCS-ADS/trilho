using Trilho.Communication.Requests.PasswordReset;

namespace Trilho.Application.UseCases.PasswordReset.Confirm;
public interface IConfirmPasswordResetUseCase
{
    Task Execute(RequestConfirmPasswordResetJson request);
}
