using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Requests.Tasks;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Subtasks.Update;
public class UpdateSubtaskUseCase : IUpdateSubtaskUseCase
{
    private readonly ITaskUpdateOnlyRepository _repository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateSubtaskUseCase(ITaskUpdateOnlyRepository repository, ITaskAccessGuard guard, ILoggedUser loggedUser, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _guard = guard;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long taskId, long subtaskId, RequestUpdateSubtaskJson request)
    {
        request.Title = request.Title?.Trim() ?? string.Empty;

        var validation = new UpdateSubtaskValidator().Validate(request);

        if (validation.IsValid == false)
        {
            throw new ErrorOnValidationException(validation.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var user = await _loggedUser.User();

        var task = await _repository.GetById(taskId) ?? throw new NotFoundException(ResourceErrorsMessage.TASK_NOT_FOUND);

        var team = await _guard.GetTeamForMember(user, task.TeamId);

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        var subtask = task.Subtasks.Find(item => item.Id == subtaskId)
            ?? throw new NotFoundException(ResourceErrorsMessage.SUBTASK_NOT_FOUND);

        _guard.EnsureAssigneeBelongsToTeam(team, request.AssigneeId);

        if (subtask.IsDone != request.IsDone)
        {
            // Reabrir subtarefa de tarefa concluída deixaria a tarefa inconsistente.
            if (request.IsDone == false && task.Status == TaskStatuses.DONE)
            {
                throw new ConflictException(ResourceErrorsMessage.TASK_IS_DONE);
            }

            task.Record(
                user.Id,
                request.IsDone ? TaskActivityTypes.SUBTASK_COMPLETED : TaskActivityTypes.SUBTASK_REOPENED,
                toValue: request.Title.Length <= 100 ? request.Title : request.Title[..100]);
        }

        subtask.Title = request.Title;
        subtask.IsDone = request.IsDone;
        subtask.AssigneeId = request.AssigneeId;

        await _unitOfWork.Commit();
    }
}
