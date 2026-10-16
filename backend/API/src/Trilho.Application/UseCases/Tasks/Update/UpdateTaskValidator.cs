using FluentValidation;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Requests.Tasks;

namespace Trilho.Application.UseCases.Tasks.Update;
public class UpdateTaskValidator : AbstractValidator<RequestUpdateTaskJson>
{
    public UpdateTaskValidator()
    {
        RuleFor(task => task.Title).ValidTaskTitle();
        RuleFor(task => task.Description).ValidTaskDescription();
        RuleFor(task => task.Priority).ValidTaskPriority();
    }
}
