using Trilho.Communication.Requests.PasswordReset;

namespace Trilho.Application.UseCases.PasswordReset.Verify;
public interface IVerifyPasswordResetCodeUseCase
{
    Task Execute(RequestVerifyResetCodeJson request);
}
