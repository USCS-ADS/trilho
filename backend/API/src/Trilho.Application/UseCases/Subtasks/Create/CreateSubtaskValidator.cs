using FluentValidation;
using Trilho.Application.UseCases.Subtasks.Shared;
using Trilho.Communication.Requests.Tasks;

namespace Trilho.Application.UseCases.Subtasks.Create;
public class CreateSubtaskValidator : AbstractValidator<RequestSubtaskJson>
{
    public CreateSubtaskValidator()
    {
        RuleFor(subtask => subtask.Title).ValidSubtaskTitle();
    }
}
