using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Notifications;
public interface INotificationUpdateOnlyRepository
{
    /// <summary>Notificação do usuário (rastreada), ou nula se não existir ou for de outra pessoa.</summary>
    Task<Notification?> GetByIdForUser(long id, long userId);

    Task<List<Notification>> GetUnreadByUser(long userId);
}
