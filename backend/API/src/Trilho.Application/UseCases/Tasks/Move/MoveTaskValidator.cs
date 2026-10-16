using FluentValidation;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Requests.Tasks;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Tasks.Move;
public class MoveTaskValidator : AbstractValidator<RequestMoveTaskJson>
{
    public MoveTaskValidator()
    {
        RuleFor(request => request.Status).ValidTaskStatus();
        RuleFor(request => request.Position).GreaterThanOrEqualTo(0).WithMessage(ResourceErrorsMessage.TASK_POSITION_INVALID);
    }
}
