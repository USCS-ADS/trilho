using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Notifications;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.Settings;

namespace Trilho.Application.UseCases.Notifications.GenerateDueSoon;
public class GenerateDueSoonNotificationsUseCase : IGenerateDueSoonNotificationsUseCase
{
    private readonly ITaskReadOnlyRepository _taskRepository;
    private readonly INotificationReadOnlyRepository _readRepository;
    private readonly INotificationWriteOnlyRepository _writeRepository;
    private readonly IPlanningSettings _settings;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public GenerateDueSoonNotificationsUseCase(
        ITaskReadOnlyRepository taskRepository,
        INotificationReadOnlyRepository readRepository,
        INotificationWriteOnlyRepository writeRepository,
        IPlanningSettings settings,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        _taskRepository = taskRepository;
        _readRepository = readRepository;
        _writeRepository = writeRepository;
        _settings = settings;
        _unitOfWork = unitOfWork;
        _timeProvider = timeProvider;
    }

    public async Task<int> Execute()
    {
        var now = _timeProvider.GetUtcNow().UtcDateTime;
        var today = DateOnly.FromDateTime(now);
        var limit = DateOnly.FromDateTime(now.AddHours(_settings.DueSoonHours));

        var tasks = await _taskRepository.GetDueSoon(today, limit);
        var created = 0;

        foreach (var task in tasks)
        {
            var dedupKey = $"due-soon:{task.Id}:{task.DueDate:yyyy-MM-dd}";

            if (await _readRepository.ExistsWithDedupKey(task.AssigneeId!.Value, dedupKey))
            {
                continue;
            }

            await _writeRepository.Create(new Notification
            {
                UserId = task.AssigneeId.Value,
                TaskId = task.Id,
                Type = NotificationTypes.TASK_DUE_SOON,
                Message = $"A tarefa \"{task.Title}\" vence em {task.DueDate:dd/MM/yyyy}.",
                DedupKey = dedupKey,
                CreatedAt = now
            });

            created++;
        }

        if (created > 0)
        {
            await _unitOfWork.Commit();
        }

        return created;
    }
}
