using AutoMapper;
using Trilho.Application.UseCases.Notifications.Shared;
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

namespace Trilho.Application.UseCases.Tasks.Create;
public class CreateTaskUseCase : ICreateTaskUseCase
{
    private readonly ITaskWriteOnlyRepository _writeRepository;
    private readonly ITaskReadOnlyRepository _readRepository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ITaskNotifier _notifier;
    private readonly TimeProvider _timeProvider;

    public CreateTaskUseCase(
        ITaskWriteOnlyRepository writeRepository,
        ITaskReadOnlyRepository readRepository,
        ITaskAccessGuard guard,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ITaskNotifier notifier,
        TimeProvider timeProvider)
    {
        _writeRepository = writeRepository;
        _readRepository = readRepository;
        _guard = guard;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notifier = notifier;
        _timeProvider = timeProvider;
    }

    public async Task<ResponseTaskJson> Execute(RequestTaskJson request)
    {
        request.Title = request.Title?.Trim() ?? string.Empty;
        request.Description = request.Description?.Trim() ?? string.Empty;

        var validation = new CreateTaskValidator().Validate(request);

        if (validation.IsValid == false)
        {
            throw new ErrorOnValidationException(validation.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var user = await _loggedUser.User();

        var team = await _guard.GetTeamForMember(user, request.TeamId);

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        _guard.EnsureAssigneeBelongsToTeam(team, request.AssigneeId);

        var status = string.IsNullOrWhiteSpace(request.Status) ? TaskStatuses.BACKLOG : request.Status;
        var now = _timeProvider.GetUtcNow().UtcDateTime;

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Status = status,
            Priority = request.Priority,
            TeamId = team.Id,
            AssigneeId = request.AssigneeId,
            CreatedById = user.Id,
            DueDate = request.DueDate,
            CompletedAt = status == TaskStatuses.DONE ? now : null,
            Position = await _readRepository.GetNextPosition(team.Id, status),
            CreatedAt = now,
            UpdatedAt = now
        };

        task.Record(user.Id, TaskActivityTypes.CREATED, toValue: status);

        if (task.AssigneeId is not null)
        {
            await _notifier.Assigned(task, task.AssigneeId.Value, user.Id);
        }

        await _writeRepository.Create(task);
        await _unitOfWork.Commit();

        var created = await _readRepository.GetById(task.Id);

        return _mapper.ToDetail(created!, _timeProvider.Today());
    }
}
