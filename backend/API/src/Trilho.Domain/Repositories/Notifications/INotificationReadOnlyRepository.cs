using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Notifications;
public interface INotificationReadOnlyRepository
{
    Task<List<Notification>> GetByUser(long userId, bool unreadOnly, int limit);
    Task<int> CountUnread(long userId);
    Task<bool> ExistsWithDedupKey(long userId, string dedupKey);
}
