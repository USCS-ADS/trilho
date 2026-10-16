using AutoMapper;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Requests.Tasks;
using Trilho.Communication.Responses.Tasks;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Subtasks.Create;
public class CreateSubtaskUseCase : ICreateSubtaskUseCase
{
    private readonly ITaskUpdateOnlyRepository _repository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateSubtaskUseCase(
        ITaskUpdateOnlyRepository repository,
        ITaskAccessGuard guard,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _repository = repository;
        _guard = guard;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ResponseSubtaskJson> Execute(long taskId, RequestSubtaskJson request)
    {
        request.Title = request.Title?.Trim() ?? string.Empty;

        var validation = new CreateSubtaskValidator().Validate(request);

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

        // Uma tarefa concluída não pode ganhar subtarefa pendente (RF04).
        if (task.Status == TaskStatuses.DONE)
        {
            throw new ConflictException(ResourceErrorsMessage.TASK_IS_DONE);
        }

        _guard.EnsureAssigneeBelongsToTeam(team, request.AssigneeId);

        var subtask = new Subtask { TaskId = task.Id, Title = request.Title, AssigneeId = request.AssigneeId };

        task.Subtasks.Add(subtask);
        task.Record(user.Id, TaskActivityTypes.SUBTASK_ADDED, toValue: Truncate(subtask.Title));

        await _unitOfWork.Commit();

        return _mapper.Map<ResponseSubtaskJson>(subtask);
    }

    private static string Truncate(string value) => value.Length <= 100 ? value : value[..100];
}
