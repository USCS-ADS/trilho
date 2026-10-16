using FluentValidation;
using Trilho.Application.UseCases.Teams.Shared;
using Trilho.Communication.Requests.Teams;

namespace Trilho.Application.UseCases.Teams.Update;
public class UpdateTeamValidator : AbstractValidator<RequestUpdateTeamJson>
{
    public UpdateTeamValidator()
    {
        RuleFor(team => team.Name).ValidTeamName();
        RuleFor(team => team.Description).ValidTeamDescription();
    }
}
