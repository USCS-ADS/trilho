using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Responses.Prioritization;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Domain.Services.Prioritization;

namespace Trilho.Application.UseCases.Prioritization.GetRanking;
public class GetRankingUseCase : IGetRankingUseCase
{
    private readonly ITaskReadOnlyRepository _taskRepository;
    private readonly IUserReadOnlyRepository _userRepository;
    private readonly IPrioritizationEngine _engine;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly TimeProvider _timeProvider;

    public GetRankingUseCase(
        ITaskReadOnlyRepository taskRepository,
        IUserReadOnlyRepository userRepository,
        IPrioritizationEngine engine,
        ITaskAccessGuard guard,
        ILoggedUser loggedUser,
        TimeProvider timeProvider)
    {
        _taskRepository = taskRepository;
        _userRepository = userRepository;
        _engine = engine;
        _guard = guard;
        _loggedUser = loggedUser;
        _timeProvider = timeProvider;
    }

    public async Task<List<ResponseRankedTaskJson>> Execute(long? teamId)
    {
        var user = await _loggedUser.User();

        var teamIds = await _guard.ResolveVisibleTeamIds(user, teamId);
        var tasks = (await _taskRepository.GetBoard(new TaskFilter(teamIds))).Items;
        var open = tasks.Where(task => task.Status != Trilho.Domain.Enum.TaskStatuses.DONE).ToList();

        var assigneeIds = open.Where(task => task.AssigneeId is not null).Select(task => task.AssigneeId!.Value).Distinct().ToList();
        var openByAssignee = await _taskRepository.CountOpenByAssignee(assigneeIds);

        var names = (await _userRepository.GetAll())
            .Where(candidate => assigneeIds.Contains(candidate.Id))
            .ToDictionary(candidate => candidate.Id, candidate => candidate.Name);

        var ranking = _engine.Rank(open, _timeProvider.Today(), openByAssignee, names);

        return ranking.Select((ranked, index) => new ResponseRankedTaskJson
        {
            Rank = index + 1,
            TaskId = ranked.Task.Id,
            Title = ranked.Task.Title,
            Status = ranked.Task.Status,
            TeamId = ranked.Task.TeamId,
            AssigneeId = ranked.Task.AssigneeId,
            DueDate = ranked.Task.DueDate,
            CurrentPriority = ranked.Task.Priority,
            SuggestedPriority = ranked.SuggestedPriority,
            Justification = ranked.Justification
        }).ToList();
    }
}
