using FluentValidation;
using Trilho.Communication.Requests.Prioritization;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Prioritization.Suggest;
public class SuggestionValidator : AbstractValidator<RequestSuggestionJson>
{
    public SuggestionValidator()
    {
        RuleFor(request => request.TeamId).GreaterThan(0).WithMessage(ResourceErrorsMessage.TASK_TEAM_REQUIRED);
    }
}
