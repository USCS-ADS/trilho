using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Notifications;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Notifications.MarkAsRead;
public class MarkNotificationAsReadUseCase : IMarkNotificationAsReadUseCase
{
    private readonly INotificationUpdateOnlyRepository _repository;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public MarkNotificationAsReadUseCase(
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

    public async Task Execute(long id)
    {
        var user = await _loggedUser.User();

        // Notificação de outra pessoa é tratada como inexistente.
        var notification = await _repository.GetByIdForUser(id, user.Id)
            ?? throw new NotFoundException(ResourceErrorsMessage.NOTIFICATION_NOT_FOUND);

        if (notification.IsRead)
        {
            return;
        }

        notification.ReadAt = _timeProvider.GetUtcNow().UtcDateTime;

        await _unitOfWork.Commit();
    }
}
