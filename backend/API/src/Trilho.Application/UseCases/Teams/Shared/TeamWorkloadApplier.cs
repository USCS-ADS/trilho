using Trilho.Application.Services;
using Trilho.Communication.Responses.Teams;
using Trilho.Domain.Repositories.Dashboard;
using Trilho.Domain.Services.Settings;

namespace Trilho.Application.UseCases.Teams.Shared;
internal static class TeamWorkloadApplier
{
    public static void Apply(IEnumerable<ResponseTeamJson> teams, IReadOnlyCollection<TeamLoad> loads, IPlanningSettings settings)
    {
        var byTeam = loads.ToDictionary(load => load.TeamId);

        foreach (var team in teams)
        {
            // Times arquivados não entram na carga (ficam zerados).
            if (byTeam.TryGetValue(team.Id, out var load) == false)
            {
                continue;
            }

            team.OpenTasks = load.OpenTasks;
            team.WorkloadPercent = WorkloadCalculator.Percent(load.OpenTasks, load.MemberCount, settings.TasksPerMember);
            team.IsOverloaded = team.WorkloadPercent > settings.AlertThresholdPercent;
        }
    }
}
