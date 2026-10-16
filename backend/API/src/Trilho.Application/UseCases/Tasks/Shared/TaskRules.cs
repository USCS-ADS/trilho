using FluentValidation;
using Trilho.Domain.Enum;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Tasks.Shared;
public static class TaskRules
{
    public static IRuleBuilderOptions<T, string> ValidTaskTitle<T>(this IRuleBuilder<T, string> rule)
    {
        return rule
            .NotEmpty().WithMessage(ResourceErrorsMessage.TASK_TITLE_REQUIRED)
            .MaximumLength(200).WithMessage(ResourceErrorsMessage.TASK_TITLE_TOO_LONG);
    }

    public static IRuleBuilderOptions<T, string> ValidTaskDescription<T>(this IRuleBuilder<T, string> rule)
    {
        return rule.MaximumLength(2000).WithMessage(ResourceErrorsMessage.TASK_DESCRIPTION_TOO_LONG);
    }

    public static IRuleBuilderOptions<T, string> ValidTaskPriority<T>(this IRuleBuilder<T, string> rule)
    {
        return rule.Must(priority => TaskPriorities.IsValid(priority)).WithMessage(ResourceErrorsMessage.TASK_PRIORITY_INVALID);
    }

    public static IRuleBuilderOptions<T, string> ValidTaskStatus<T>(this IRuleBuilder<T, string> rule)
    {
        return rule.Must(status => TaskStatuses.IsValid(status)).WithMessage(ResourceErrorsMessage.TASK_STATUS_INVALID);
    }
}
