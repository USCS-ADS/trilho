using Trilho.Application.UseCases.Notifications.Shared;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Requests.Tasks;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Tasks.Update;
public class UpdateTaskUseCase : IUpdateTaskUseCase
{
    private readonly ITaskUpdateOnlyRepository _repository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITaskNotifier _notifier;
    private readonly TimeProvider _timeProvider;

    public UpdateTaskUseCase(
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

    public async Task Execute(long id, RequestUpdateTaskJson request)
    {
        var user = await _loggedUser.User();

        var task = await _repository.GetById(id) ?? throw new NotFoundException(ResourceErrorsMessage.TASK_NOT_FOUND);

        var team = await _guard.GetTeamForMember(user, task.TeamId);

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        request.Title = request.Title?.Trim() ?? string.Empty;
        request.Description = request.Description?.Trim() ?? string.Empty;

        var validation = new UpdateTaskValidator().Validate(request);

        if (validation.IsValid == false)
        {
            throw new ErrorOnValidationException(validation.Errors.Select(e => e.ErrorMessage).ToList());
        }

        _guard.EnsureAssigneeBelongsToTeam(team, request.AssigneeId);

        if (task.Title != request.Title || task.Description != request.Description)
        {
            task.Record(user.Id, TaskActivityTypes.UPDATED);
        }

        if (task.Priority != request.Priority)
        {
            task.Record(user.Id, TaskActivityTypes.PRIORITY_CHANGED, task.Priority, request.Priority);
        }

        if (task.AssigneeId != request.AssigneeId)
        {
            task.Record(user.Id, TaskActivityTypes.ASSIGNEE_CHANGED, task.AssigneeId?.ToString(), request.AssigneeId?.ToString());
        }

        if (task.DueDate != request.DueDate)
        {
            task.Record(user.Id, TaskActivityTypes.DUE_DATE_CHANGED, task.DueDate?.ToString("yyyy-MM-dd"), request.DueDate?.ToString("yyyy-MM-dd"));
        }

        var assigneeChanged = task.AssigneeId != request.AssigneeId;

        task.Title = request.Title;
        task.Description = request.Description;
        task.Priority = request.Priority;
        task.AssigneeId = request.AssigneeId;
        task.DueDate = request.DueDate;
        task.UpdatedAt = _timeProvider.GetUtcNow().UtcDateTime;

        if (assigneeChanged && request.AssigneeId is not null)
        {
            await _notifier.Assigned(task, request.AssigneeId.Value, user.Id);
        }

        _repository.Update(task);

        await _unitOfWork.Commit();
    }
}
