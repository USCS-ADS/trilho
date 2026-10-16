namespace Trilho.Application.UseCases.Notifications.MarkAsRead;
public interface IMarkNotificationAsReadUseCase
{
    Task Execute(long id);
}
