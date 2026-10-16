using Trilho.Application.Services;
using Trilho.Application.UseCases.Dashboard.Shared;
using Trilho.Communication.Responses.Dashboard;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories.Dashboard;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Domain.Services.Settings;

namespace Trilho.Application.UseCases.Dashboard.Get;
public class GetDashboardUseCase : IGetDashboardUseCase
{
    private const int SprintsShown = 5;

    private readonly IDashboardReadOnlyRepository _repository;
    private readonly ITeamReadOnlyRepository _teamRepository;
    private readonly IPlanningSettings _settings;
    private readonly ILoggedUser _loggedUser;
    private readonly TimeProvider _timeProvider;

    public GetDashboardUseCase(
        IDashboardReadOnlyRepository repository,
        ITeamReadOnlyRepository teamRepository,
        IPlanningSettings settings,
        ILoggedUser loggedUser,
        TimeProvider timeProvider)
    {
        _repository = repository;
        _teamRepository = teamRepository;
        _settings = settings;
        _loggedUser = loggedUser;
        _timeProvider = timeProvider;
    }

    public async Task<ResponseDashboardJson> Execute()
    {
        var user = await _loggedUser.User();

        // Administrador: todos os times. Líder: apenas os times que lidera.
        IReadOnlyCollection<long>? teamIds = null;

        if (user.Role != Roles.ADMIN)
        {
            var teams = await _teamRepository.GetAll(user.Id);
            teamIds = teams.Where(team => team.LeaderId == user.Id).Select(team => team.Id).ToList();
        }

        var now = _timeProvider.GetUtcNow().UtcDateTime;
        var today = DateOnly.FromDateTime(now);

        var byStatus = await _repository.CountTasksByStatus(teamIds);
        var overdue = await _repository.CountOverdueTasks(teamIds, today);
        var loads = await _repository.GetTeamLoads(teamIds);

        var currentIndex = SprintCalendar.IndexOf(today, _settings.SprintAnchorDate, _settings.SprintLengthDays);
        var firstIndex = currentIndex - (SprintsShown - 1);
        var firstStart = SprintCalendar.RangeOf(firstIndex, _settings.SprintAnchorDate, _settings.SprintLengthDays).Start;
        var completedPerDay = await _repository.CountCompletedPerDay(teamIds, firstStart.ToDateTime(TimeOnly.MinValue));

        var sprints = new List<ResponseSprintJson>();

        for (var index = firstIndex; index <= currentIndex; index++)
        {
            var (start, end) = SprintCalendar.RangeOf(index, _settings.SprintAnchorDate, _settings.SprintLengthDays);

            sprints.Add(new ResponseSprintJson
            {
                Label = SprintCalendar.LabelOf(index),
                StartDate = start,
                EndDate = end,
                Completed = completedPerDay.Where(day => day.Key >= start && day.Key <= end).Sum(day => day.Value),
                IsCurrent = index == currentIndex
            });
        }

        var workloads = loads.Select(load =>
        {
            var capacity = WorkloadCalculator.Capacity(load.MemberCount, _settings.TasksPerMember);
            var percent = WorkloadCalculator.Percent(load.OpenTasks, load.MemberCount, _settings.TasksPerMember);

            return new ResponseTeamWorkloadJson
            {
                TeamId = load.TeamId,
                TeamName = load.TeamName,
                MemberCount = load.MemberCount,
                OpenTasks = load.OpenTasks,
                Capacity = capacity,
                WorkloadPercent = percent,
                IsOverloaded = percent > _settings.AlertThresholdPercent
            };
        }).OrderByDescending(workload => workload.WorkloadPercent).ToList();

        return new ResponseDashboardJson
        {
            ActiveTasks = byStatus.Where(item => item.Key != TaskStatuses.DONE).Sum(item => item.Value),
            CompletedInCurrentSprint = sprints[^1].Completed,
            OverdueTasks = overdue,
            ActiveTeams = loads.Count,
            AlertThresholdPercent = _settings.AlertThresholdPercent,
            TasksByStatus = TaskStatuses.All
                .Select(status => new ResponseStatusCountJson { Status = status, Count = byStatus.GetValueOrDefault(status) })
                .ToList(),
            TeamWorkloads = workloads,
            Sprints = sprints
        };
    }
}
