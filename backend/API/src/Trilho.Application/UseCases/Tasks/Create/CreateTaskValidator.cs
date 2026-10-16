using FluentValidation;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Requests.Tasks;
using Trilho.Domain.Enum;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Tasks.Create;
public class CreateTaskValidator : AbstractValidator<RequestTaskJson>
{
    public CreateTaskValidator()
    {
        RuleFor(task => task.Title).ValidTaskTitle();
        RuleFor(task => task.Description).ValidTaskDescription();
        RuleFor(task => task.TeamId).GreaterThan(0).WithMessage(ResourceErrorsMessage.TASK_TEAM_REQUIRED);
        RuleFor(task => task.Priority).ValidTaskPriority();
        RuleFor(task => task.Status!).ValidTaskStatus().When(task => string.IsNullOrWhiteSpace(task.Status) == false);
    }
}
