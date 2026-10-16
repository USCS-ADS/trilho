using Trilho.Communication.Responses.Notifications;
using Trilho.Domain.Repositories.Notifications;
using Trilho.Domain.Services.LoggedUser;

namespace Trilho.Application.UseCases.Notifications.GetMine;
public class GetMyNotificationsUseCase : IGetMyNotificationsUseCase
{
    private const int MaxLimit = 100;

    private readonly INotificationReadOnlyRepository _repository;
    private readonly ILoggedUser _loggedUser;

    public GetMyNotificationsUseCase(INotificationReadOnlyRepository repository, ILoggedUser loggedUser)
    {
        _repository = repository;
        _loggedUser = loggedUser;
    }

    public async Task<ResponseNotificationListJson> Execute(bool unreadOnly, int limit)
    {
        var user = await _loggedUser.User();
        var take = Math.Clamp(limit, 1, MaxLimit);

        var notifications = await _repository.GetByUser(user.Id, unreadOnly, take);

        return new ResponseNotificationListJson
        {
            UnreadCount = await _repository.CountUnread(user.Id),
            Notifications = notifications.Select(notification => new ResponseNotificationJson
            {
                Id = notification.Id,
                Type = notification.Type,
                Message = notification.Message,
                TaskId = notification.TaskId,
                CreatedAt = notification.CreatedAt,
                IsRead = notification.IsRead
            }).ToList()
        };
    }
}
