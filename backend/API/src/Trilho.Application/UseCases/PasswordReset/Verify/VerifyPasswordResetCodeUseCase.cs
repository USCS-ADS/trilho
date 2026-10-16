using Trilho.Application.UseCases.PasswordReset.Shared;
using Trilho.Communication.Requests.PasswordReset;

namespace Trilho.Application.UseCases.PasswordReset.Verify;
public class VerifyPasswordResetCodeUseCase : IVerifyPasswordResetCodeUseCase
{
    private readonly IPasswordResetCodeChecker _checker;

    public VerifyPasswordResetCodeUseCase(IPasswordResetCodeChecker checker)
    {
        _checker = checker;
    }

    public async Task Execute(RequestVerifyResetCodeJson request)
    {
        await _checker.Check(request.Email, request.Code);
    }
}
