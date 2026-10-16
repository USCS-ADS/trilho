using FluentValidation;
using Trilho.Communication.Requests.Invites;
using Trilho.Domain.Enum;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Invites.Create;
public class CreateInviteValidator : AbstractValidator<RequestInviteJson>
{
    public CreateInviteValidator()
    {
        RuleFor(invite => invite.FullName)
            .NotEmpty().WithMessage(ResourceErrorsMessage.NAME_REQUIRED)
            .MaximumLength(200).WithMessage(ResourceErrorsMessage.NAME_REQUIRED);
        RuleFor(invite => invite.Email)
            .NotEmpty().WithMessage(ResourceErrorsMessage.EMAIL_REQUIRED)
            .EmailAddress().WithMessage(ResourceErrorsMessage.INVALID_EMAIL);
        RuleFor(invite => invite.TeamId).GreaterThan(0).WithMessage(ResourceErrorsMessage.INVITE_TEAM_REQUIRED);
        RuleFor(invite => invite.Role).Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage(ResourceErrorsMessage.ROLE_REQUIRED)
            .Must(Roles.IsValid).WithMessage(ResourceErrorsMessage.ROLE_INVALID);
    }
}
