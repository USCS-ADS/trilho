using FluentValidation;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Teams.Shared;
public static class TeamRules
{
    public static IRuleBuilderOptions<T, string> ValidTeamName<T>(this IRuleBuilder<T, string> rule)
    {
        return rule
            .NotEmpty().WithMessage(ResourceErrorsMessage.TEAM_NAME_REQUIRED)
            .MaximumLength(100).WithMessage(ResourceErrorsMessage.TEAM_NAME_TOO_LONG);
    }

    public static IRuleBuilderOptions<T, string> ValidTeamDescription<T>(this IRuleBuilder<T, string> rule)
    {
        return rule.MaximumLength(500).WithMessage(ResourceErrorsMessage.TEAM_DESCRIPTION_TOO_LONG);
    }
}
