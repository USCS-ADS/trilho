using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Notifications;
public interface INotificationWriteOnlyRepository
{
    Task Create(Notification notification);
}
