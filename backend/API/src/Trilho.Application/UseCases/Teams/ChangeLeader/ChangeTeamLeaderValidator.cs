using FluentValidation;
using Trilho.Communication.Requests.Teams;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Teams.ChangeLeader;
public class ChangeTeamLeaderValidator : AbstractValidator<RequestChangeLeaderJson>
{
    public ChangeTeamLeaderValidator()
    {
        RuleFor(request => request.LeaderId).GreaterThan(0).WithMessage(ResourceErrorsMessage.TEAM_LEADER_REQUIRED);
    }
}
