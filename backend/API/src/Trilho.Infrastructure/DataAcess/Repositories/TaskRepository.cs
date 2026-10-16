using Microsoft.EntityFrameworkCore;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Tasks;

namespace Trilho.Infrastructure.DataAcess.Repositories;
internal class TaskRepository : ITaskWriteOnlyRepository, ITaskUpdateOnlyRepository, ITaskReadOnlyRepository
{
    private readonly TrilhoDbContext _dbContext;

    public TaskRepository(TrilhoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Create(TaskItem task)
    {
        await _dbContext.Tasks.AddAsync(task);
    }

    public async Task<bool> Delete(long id)
    {
        var task = await _dbContext.Tasks.FirstOrDefaultAsync(t => t.Id == id);

        if (task is null)
        {
            return false;
        }

        _dbContext.Tasks.Remove(task);

        return true;
    }

    public async Task<PagedResult<TaskItem>> GetBoard(TaskFilter filter)
    {
        var query = _dbContext.Tasks.AsNoTracking()
            .Include(task => task.Subtasks)
            .Include(task => task.Comments)
            .AsQueryable();

        if (filter.TeamIds is not null)
        {
            var teamIds = filter.TeamIds.ToList();
            query = query.Where(task => teamIds.Contains(task.TeamId));
        }

        if (filter.AssigneeId is not null)
        {
            query = query.Where(task => task.AssigneeId == filter.AssigneeId);
        }

        if (string.IsNullOrWhiteSpace(filter.Status) == false)
        {
            query = query.Where(task => task.Status == filter.Status);
        }

        if (string.IsNullOrWhiteSpace(filter.Priority) == false)
        {
            query = query.Where(task => task.Priority == filter.Priority);
        }

        var total = await query.CountAsync();

        IQueryable<TaskItem> ordered = query.OrderBy(task => task.TeamId).ThenBy(task => task.Status).ThenBy(task => task.Position).ThenBy(task => task.Id);

        if (filter.Page is not null && filter.PageSize is not null)
        {
            ordered = ordered.Skip((filter.Page.Value - 1) * filter.PageSize.Value).Take(filter.PageSize.Value);
        }

        return new PagedResult<TaskItem>(await ordered.ToListAsync(), total);
    }

    async Task<TaskItem?> ITaskReadOnlyRepository.GetById(long id)
    {
        return await _dbContext.Tasks.AsNoTracking()
            .Include(task => task.Subtasks)
            .Include(task => task.Comments).ThenInclude(comment => comment.Author)
            .Include(task => task.CreatedBy)
            .Include(task => task.Assignee)
            .FirstOrDefaultAsync(task => task.Id == id);
    }

    async Task<TaskItem?> ITaskUpdateOnlyRepository.GetById(long id)
    {
        return await _dbContext.Tasks
            .Include(task => task.Subtasks)
            .Include(task => task.Comments)
            .FirstOrDefaultAsync(task => task.Id == id);
    }

    public async Task<List<TaskActivity>> GetActivity(long taskId)
    {
        return await _dbContext.TaskActivities.AsNoTracking()
            .Include(activity => activity.Actor)
            .Where(activity => activity.TaskId == taskId)
            .OrderByDescending(activity => activity.CreatedAt).ThenByDescending(activity => activity.Id)
            .ToListAsync();
    }

    public async Task<int> GetNextPosition(long teamId, string status)
    {
        var last = await _dbContext.Tasks
            .Where(task => task.TeamId == teamId && task.Status == status)
            .Select(task => (int?)task.Position)
            .MaxAsync();

        return last is null ? 0 : last.Value + 1;
    }

    public async Task<bool> ExistsForTeam(long teamId)
    {
        return await _dbContext.Tasks.AnyAsync(task => task.TeamId == teamId);
    }

    public async Task<List<TaskItem>> GetDueSoon(DateOnly from, DateOnly to)
    {
        return await _dbContext.Tasks.AsNoTracking()
            .Where(task => task.AssigneeId != null
                && task.Status != Domain.Enum.TaskStatuses.DONE
                && task.DueDate != null && task.DueDate >= from && task.DueDate <= to)
            .ToListAsync();
    }

    public async Task<Dictionary<long, int>> CountOpenByAssignee(IReadOnlyCollection<long> userIds)
    {
        var ids = userIds.ToList();

        var rows = await _dbContext.Tasks.AsNoTracking()
            .Where(task => task.AssigneeId != null && ids.Contains(task.AssigneeId.Value) && task.Status != Domain.Enum.TaskStatuses.DONE)
            .GroupBy(task => task.AssigneeId!.Value)
            .Select(group => new { UserId = group.Key, Count = group.Count() })
            .ToListAsync();

        return rows.ToDictionary(row => row.UserId, row => row.Count);
    }

    public async Task<List<TaskItem>> GetOpenByTeam(long teamId)
    {
        return await _dbContext.Tasks
            .Where(task => task.TeamId == teamId && task.Status != Domain.Enum.TaskStatuses.DONE)
            .OrderBy(task => task.Id)
            .ToListAsync();
    }

    public async Task<List<TaskItem>> GetColumn(long teamId, string status)
    {
        return await _dbContext.Tasks
            .Where(task => task.TeamId == teamId && task.Status == status)
            .OrderBy(task => task.Position).ThenBy(task => task.Id)
            .ToListAsync();
    }

    public void Update(TaskItem task)
    {
        _dbContext.Tasks.Update(task);
    }
}
