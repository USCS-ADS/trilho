using FluentValidation;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Subtasks.Shared;
public static class SubtaskRules
{
    public static IRuleBuilderOptions<T, string> ValidSubtaskTitle<T>(this IRuleBuilder<T, string> rule)
    {
        return rule
            .NotEmpty().WithMessage(ResourceErrorsMessage.SUBTASK_TITLE_REQUIRED)
            .MaximumLength(200).WithMessage(ResourceErrorsMessage.SUBTASK_TITLE_TOO_LONG);
    }
}
