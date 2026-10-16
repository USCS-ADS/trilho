using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Notifications;
using Trilho.Domain.Services.LoggedUser;

namespace Trilho.Application.UseCases.Notifications.MarkAllAsRead;
public class MarkAllNotificationsAsReadUseCase : IMarkAllNotificationsAsReadUseCase
{
    private readonly INotificationUpdateOnlyRepository _repository;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public MarkAllNotificationsAsReadUseCase(
        INotificationUpdateOnlyRepository repository,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        _repository = repository;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
        _timeProvider = timeProvider;
    }

    public async Task Execute()
    {
        var user = await _loggedUser.User();
        var now = _timeProvider.GetUtcNow().UtcDateTime;

        var unread = await _repository.GetUnreadByUser(user.Id);

        foreach (var notification in unread)
        {
            notification.ReadAt = now;
        }

        await _unitOfWork.Commit();
    }
}
