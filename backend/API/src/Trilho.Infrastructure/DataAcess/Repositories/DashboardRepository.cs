using Microsoft.EntityFrameworkCore;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories.Dashboard;

namespace Trilho.Infrastructure.DataAcess.Repositories;
internal class DashboardRepository : IDashboardReadOnlyRepository
{
    private readonly TrilhoDbContext _dbContext;

    public DashboardRepository(TrilhoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Dictionary<string, int>> CountTasksByStatus(IReadOnlyCollection<long>? teamIds)
    {
        var rows = await ScopedTasks(teamIds)
            .GroupBy(task => task.Status)
            .Select(group => new { Status = group.Key, Count = group.Count() })
            .ToListAsync();

        return rows.ToDictionary(row => row.Status, row => row.Count);
    }

    public async Task<int> CountOverdueTasks(IReadOnlyCollection<long>? teamIds, DateOnly today)
    {
        return await ScopedTasks(teamIds)
            .CountAsync(task => task.DueDate != null && task.DueDate < today && task.Status != TaskStatuses.DONE);
    }

    public async Task<List<TeamLoad>> GetTeamLoads(IReadOnlyCollection<long>? teamIds)
    {
        var teams = _dbContext.Teams.AsNoTracking().Where(team => team.IsArchived == false);

        if (teamIds is not null)
        {
            var ids = teamIds.ToList();
            teams = teams.Where(team => ids.Contains(team.Id));
        }

        var rows = await teams
            .Select(team => new
            {
                team.Id,
                team.Name,
                MemberCount = team.Members.Count,
                OpenTasks = _dbContext.Tasks.Count(task => task.TeamId == team.Id && task.Status != TaskStatuses.DONE)
            })
            .OrderBy(row => row.Name)
            .ToListAsync();

        return rows.Select(row => new TeamLoad(row.Id, row.Name, row.MemberCount, row.OpenTasks)).ToList();
    }

    public async Task<Dictionary<DateOnly, int>> CountCompletedPerDay(IReadOnlyCollection<long>? teamIds, DateTime since)
    {
        var completedAt = await ScopedTasks(teamIds)
            .Where(task => task.Status == TaskStatuses.DONE && task.CompletedAt != null && task.CompletedAt >= since)
            .Select(task => task.CompletedAt!.Value)
            .ToListAsync();

        // Agrupamento no cliente: evita depender de tradução de DATE() entre provedores.
        return completedAt
            .GroupBy(date => DateOnly.FromDateTime(date))
            .ToDictionary(group => group.Key, group => group.Count());
    }

    private IQueryable<Domain.Entities.TaskItem> ScopedTasks(IReadOnlyCollection<long>? teamIds)
    {
        var tasks = _dbContext.Tasks.AsNoTracking().AsQueryable();

        if (teamIds is not null)
        {
            var ids = teamIds.ToList();
            tasks = tasks.Where(task => ids.Contains(task.TeamId));
        }

        return tasks;
    }
}
