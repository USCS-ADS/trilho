using FluentValidation;
using Trilho.Application.UseCases.Users;
using Trilho.Communication.Requests.PasswordReset;

namespace Trilho.Application.UseCases.PasswordReset.Confirm;
public class ConfirmPasswordResetValidator : AbstractValidator<RequestConfirmPasswordResetJson>
{
    public ConfirmPasswordResetValidator()
    {
        RuleFor(request => request.NewPassword).SetValidator(new PasswordValidator<RequestConfirmPasswordResetJson>());
    }
}
