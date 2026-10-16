using FluentValidation;
using Trilho.Communication.Requests.Tasks;
using Trilho.Exception;

namespace Trilho.Application.UseCases.Comments.Create;
public class CreateCommentValidator : AbstractValidator<RequestCommentJson>
{
    public CreateCommentValidator()
    {
        RuleFor(comment => comment.Body)
            .NotEmpty().WithMessage(ResourceErrorsMessage.COMMENT_BODY_REQUIRED)
            .MaximumLength(2000).WithMessage(ResourceErrorsMessage.COMMENT_BODY_TOO_LONG);
    }
}
