using FluentValidation;
using Trilho.Application.UseCases.Subtasks.Shared;
using Trilho.Communication.Requests.Tasks;

namespace Trilho.Application.UseCases.Subtasks.Update;
public class UpdateSubtaskValidator : AbstractValidator<RequestUpdateSubtaskJson>
{
    public UpdateSubtaskValidator()
    {
        RuleFor(subtask => subtask.Title).ValidSubtaskTitle();
    }
}
