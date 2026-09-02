using FluentValidation;
using GCP.Application.UseCases.Users;
using Trilho.Communication.Requests.Users;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Users.Create;
public class CreateUserValidator : AbstractValidator<RequestUserJson>
{
    public CreateUserValidator()
    {
        RuleFor(user => user.Name).NotEmpty().WithMessage(ResourceErrorsMessage.NAME_REQUIRED);
        RuleFor(user => user.Role).NotEmpty().WithMessage(ResourceErrorsMessage.NAME_REQUIRED);
        RuleFor(user => user.Email).NotEmpty().WithMessage(ResourceErrorsMessage.EMAIL_REQUIRED).EmailAddress().WithMessage(ResourceErrorsMessage.INVALID_EMAIL);
        RuleFor(user => user.Password).SetValidator(new PasswordValidator<RequestUserJson>());
    }
}

