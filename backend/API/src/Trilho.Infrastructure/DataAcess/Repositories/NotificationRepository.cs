using Microsoft.EntityFrameworkCore;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories.Notifications;

namespace Trilho.Infrastructure.DataAcess.Repositories;
internal class NotificationRepository : INotificationWriteOnlyRepository, INotificationUpdateOnlyRepository, INotificationReadOnlyRepository
{
    private readonly TrilhoDbContext _dbContext;

    public NotificationRepository(TrilhoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Create(Notification notification)
    {
        await _dbContext.Notifications.AddAsync(notification);
    }

    public async Task<List<Notification>> GetByUser(long userId, bool unreadOnly, int limit)
    {
        var query = _dbContext.Notifications.AsNoTracking().Where(notification => notification.UserId == userId);

        if (unreadOnly)
        {
            query = query.Where(notification => notification.ReadAt == null);
        }

        return await query
            .OrderByDescending(notification => notification.CreatedAt).ThenByDescending(notification => notification.Id)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<int> CountUnread(long userId)
    {
        return await _dbContext.Notifications.CountAsync(notification => notification.UserId == userId && notification.ReadAt == null);
    }

    public async Task<bool> ExistsWithDedupKey(long userId, string dedupKey)
    {
        return await _dbContext.Notifications.AnyAsync(notification => notification.UserId == userId && notification.DedupKey == dedupKey);
    }

    public async Task<Notification?> GetByIdForUser(long id, long userId)
    {
        return await _dbContext.Notifications.FirstOrDefaultAsync(notification => notification.Id == id && notification.UserId == userId);
    }

    public async Task<List<Notification>> GetUnreadByUser(long userId)
    {
        return await _dbContext.Notifications.Where(notification => notification.UserId == userId && notification.ReadAt == null).ToListAsync();
    }
}
