using FluentValidation;
using Trilho.Application.UseCases.Teams.Shared;
using Trilho.Communication.Requests.Teams;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Teams.Create;
public class CreateTeamValidator : AbstractValidator<RequestTeamJson>
{
    public CreateTeamValidator()
    {
        RuleFor(team => team.Name).ValidTeamName();
        RuleFor(team => team.Description).ValidTeamDescription();
        RuleFor(team => team.LeaderId).GreaterThan(0).WithMessage(ResourceErrorsMessage.TEAM_LEADER_REQUIRED);
    }
}
