using Trilho.Application.UseCases.Notifications.Shared;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Requests.Tasks;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Tasks.Move;
public class MoveTaskUseCase : IMoveTaskUseCase
{
    private readonly ITaskUpdateOnlyRepository _repository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITaskNotifier _notifier;
    private readonly TimeProvider _timeProvider;

    public MoveTaskUseCase(
        ITaskUpdateOnlyRepository repository,
        ITaskAccessGuard guard,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork,
        ITaskNotifier notifier,
        TimeProvider timeProvider)
    {
        _repository = repository;
        _guard = guard;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
        _notifier = notifier;
        _timeProvider = timeProvider;
    }

    public async Task Execute(long id, RequestMoveTaskJson request)
    {
        var validation = new MoveTaskValidator().Validate(request);

        if (validation.IsValid == false)
        {
            throw new ErrorOnValidationException(validation.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var user = await _loggedUser.User();

        var task = await _repository.GetById(id) ?? throw new NotFoundException(ResourceErrorsMessage.TASK_NOT_FOUND);

        var team = await _guard.GetTeamForMember(user, task.TeamId);

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        var statusChanged = task.Status != request.Status;

        // RF04: a tarefa só é concluída quando todas as subtarefas estiverem concluídas.
        if (statusChanged && request.Status == TaskStatuses.DONE && task.HasPendingSubtasks)
        {
            throw new ConflictException(ResourceErrorsMessage.TASK_HAS_PENDING_SUBTASKS);
        }

        var fromStatus = task.Status;
        var now = _timeProvider.GetUtcNow().UtcDateTime;

        var column = await _repository.GetColumn(task.TeamId, request.Status);
        column.RemoveAll(item => item.Id == task.Id);

        var index = Math.Min(request.Position, column.Count);

        task.Status = request.Status;
        column.Insert(index, task);

        for (var position = 0; position < column.Count; position++)
        {
            column[position].Position = position;
        }

        if (statusChanged)
        {
            task.CompletedAt = request.Status == TaskStatuses.DONE ? now : null;
            task.Record(user.Id, TaskActivityTypes.STATUS_CHANGED, fromStatus, request.Status);
            await _notifier.StatusChanged(task, fromStatus, request.Status, user.Id);
        }

        task.UpdatedAt = now;

        _repository.Update(task);

        await _unitOfWork.Commit();
    }
}
