using FluentValidation;
using GCP.Application.UseCases.Users;
using Trilho.Communication.Requests.Users;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Users.Update;
public class UpdateUserValidator : AbstractValidator<RequestUserJson>
{
    public UpdateUserValidator()
    {
        RuleFor(user => user.Name).NotEmpty().WithMessage(ResourceErrorsMessage.NAME_REQUIRED);
        RuleFor(user => user.Email).NotEmpty().WithMessage(ResourceErrorsMessage.EMAIL_REQUIRED).EmailAddress().WithMessage(ResourceErrorsMessage.INVALID_EMAIL);

        When(user => !string.IsNullOrWhiteSpace(user.Password), () =>
        {
            RuleFor(user => user.Password).SetValidator(new PasswordValidator<RequestUserJson>());
        });
    }
}
