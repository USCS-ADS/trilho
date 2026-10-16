using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Comments.Delete;
public class DeleteCommentUseCase : IDeleteCommentUseCase
{
    private readonly ITaskUpdateOnlyRepository _repository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCommentUseCase(ITaskUpdateOnlyRepository repository, ITaskAccessGuard guard, ILoggedUser loggedUser, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _guard = guard;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long taskId, long commentId)
    {
        var user = await _loggedUser.User();

        var task = await _repository.GetById(taskId) ?? throw new NotFoundException(ResourceErrorsMessage.TASK_NOT_FOUND);

        var team = await _guard.GetTeamForMember(user, task.TeamId);

        var comment = task.Comments.Find(item => item.Id == commentId)
            ?? throw new NotFoundException(ResourceErrorsMessage.COMMENT_NOT_FOUND);

        // O autor apaga o próprio comentário; administrador e líder do time moderam.
        if (comment.AuthorId != user.Id && team.CanBeManagedBy(user) == false)
        {
            throw new ForbiddenException(ResourceErrorsMessage.FORBIDDEN_ACTION);
        }

        task.Comments.Remove(comment);

        await _unitOfWork.Commit();
    }
}
