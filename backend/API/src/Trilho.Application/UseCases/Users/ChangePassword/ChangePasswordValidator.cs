using FluentValidation;
using Trilho.Communication.Requests.Users;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Users.ChangePassword;
public class ChangePasswordValidator : AbstractValidator<RequestChangePasswordJson>
{
    public ChangePasswordValidator()
    {
        RuleFor(request => request.CurrentPassword).NotEmpty().WithMessage(ResourceErrorsMessage.CURRENT_PASSWORD_REQUIRED);
        RuleFor(request => request.NewPassword).SetValidator(new PasswordValidator<RequestChangePasswordJson>());
    }
}
