using AutoMapper;
using Trilho.Application.UseCases.Shared;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Responses.Tasks;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Tasks.GetBoard;
public class GetBoardTaskUseCase : IGetBoardTaskUseCase
{
    // O Kanban precisa do quadro inteiro: o padrão é alto e o total vai em TotalCount para a tela avisar se truncar.
    private const int DefaultPageSize = 500;
    private const int MaxPageSize = 1000;

    private readonly ITaskReadOnlyRepository _taskRepository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IMapper _mapper;
    private readonly TimeProvider _timeProvider;

    public GetBoardTaskUseCase(
        ITaskReadOnlyRepository taskRepository,
        ITaskAccessGuard guard,
        ILoggedUser loggedUser,
        IMapper mapper,
        TimeProvider timeProvider)
    {
        _taskRepository = taskRepository;
        _guard = guard;
        _loggedUser = loggedUser;
        _mapper = mapper;
        _timeProvider = timeProvider;
    }

    public async Task<ResponseTaskListJson> Execute(long? teamId, long? assigneeId, string? status, string? priority, int? page = null, int? pageSize = null)
    {
        if (string.IsNullOrWhiteSpace(status) == false && TaskStatuses.IsValid(status) == false)
        {
            throw new ErrorOnValidationException([ResourceErrorsMessage.TASK_STATUS_INVALID]);
        }

        if (string.IsNullOrWhiteSpace(priority) == false && TaskPriorities.IsValid(priority) == false)
        {
            throw new ErrorOnValidationException([ResourceErrorsMessage.TASK_PRIORITY_INVALID]);
        }

        var user = await _loggedUser.User();

        var teamIds = await _guard.ResolveVisibleTeamIds(user, teamId);

        var (normalizedPage, normalizedSize) = Paging.Normalize(page, pageSize, DefaultPageSize, MaxPageSize);

        var result = await _taskRepository.GetBoard(new TaskFilter(teamIds, assigneeId, status, priority, normalizedPage, normalizedSize));
        var today = _timeProvider.Today();

        return new ResponseTaskListJson
        {
            Tasks = result.Items.Select(task => _mapper.ToSummary(task, today)).ToList(),
            TotalCount = result.TotalCount,
            Page = normalizedPage,
            PageSize = normalizedSize
        };
    }
}
