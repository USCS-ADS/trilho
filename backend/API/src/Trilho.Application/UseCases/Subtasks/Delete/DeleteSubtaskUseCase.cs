using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Subtasks.Delete;
public class DeleteSubtaskUseCase : IDeleteSubtaskUseCase
{
    private readonly ITaskUpdateOnlyRepository _repository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteSubtaskUseCase(ITaskUpdateOnlyRepository repository, ITaskAccessGuard guard, ILoggedUser loggedUser, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _guard = guard;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long taskId, long subtaskId)
    {
        var user = await _loggedUser.User();

        var task = await _repository.GetById(taskId) ?? throw new NotFoundException(ResourceErrorsMessage.TASK_NOT_FOUND);

        var team = await _guard.GetTeamForMember(user, task.TeamId);

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        var subtask = task.Subtasks.Find(item => item.Id == subtaskId)
            ?? throw new NotFoundException(ResourceErrorsMessage.SUBTASK_NOT_FOUND);

        task.Subtasks.Remove(subtask);

        await _unitOfWork.Commit();
    }
}
