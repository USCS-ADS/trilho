using FluentValidation;
using Trilho.Application.UseCases.Users;
using Trilho.Communication.Requests.Invites;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Invites.Accept;
public class AcceptInviteValidator : AbstractValidator<RequestAcceptInviteJson>
{
    public AcceptInviteValidator()
    {
        RuleFor(request => request.Token).NotEmpty().WithMessage(ResourceErrorsMessage.INVITE_TOKEN_REQUIRED);
        RuleFor(request => request.FullName).NotEmpty().WithMessage(ResourceErrorsMessage.NAME_REQUIRED)
            .MaximumLength(200).WithMessage(ResourceErrorsMessage.NAME_REQUIRED);
        RuleFor(request => request.Password).SetValidator(new PasswordValidator<RequestAcceptInviteJson>());
    }
}
