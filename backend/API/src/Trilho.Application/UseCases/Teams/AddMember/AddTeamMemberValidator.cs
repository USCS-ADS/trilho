using FluentValidation;
using Trilho.Communication.Requests.Teams;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Teams.AddMember;
public class AddTeamMemberValidator : AbstractValidator<RequestTeamMemberJson>
{
    public AddTeamMemberValidator()
    {
        RuleFor(request => request.UserId).GreaterThan(0).WithMessage(ResourceErrorsMessage.USER_ID_REQUIRED);
    }
}
