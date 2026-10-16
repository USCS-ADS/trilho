using Trilho.Communication.Responses.Notifications;

namespace Trilho.Application.UseCases.Notifications.GetMine;
public interface IGetMyNotificationsUseCase
{
    Task<ResponseNotificationListJson> Execute(bool unreadOnly, int limit);
}
