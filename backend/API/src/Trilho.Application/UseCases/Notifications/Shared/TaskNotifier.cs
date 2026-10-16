using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories.Notifications;

namespace Trilho.Application.UseCases.Notifications.Shared;
public class TaskNotifier : ITaskNotifier
{
    private const int MaxMessageLength = 300;

    private readonly INotificationWriteOnlyRepository _repository;

    public TaskNotifier(INotificationWriteOnlyRepository repository)
    {
        _repository = repository;
    }

    public async Task Assigned(TaskItem task, long recipientId, long actorId)
    {
        // Quem se atribui a uma tarefa não precisa ser avisado.
        if (recipientId == actorId)
        {
            return;
        }

        await Add(task, recipientId, NotificationTypes.TASK_ASSIGNED, $"Você foi designado(a) para a tarefa \"{task.Title}\".");
    }

    public async Task StatusChanged(TaskItem task, string? previousStatus, string toStatus, long actorId)
    {
        var recipients = new[] { task.AssigneeId, task.CreatedById }
            .Where(id => id is not null && id != actorId)
            .Select(id => id!.Value)
            .Distinct();

        foreach (var recipientId in recipients)
        {
            await Add(task, recipientId, NotificationTypes.TASK_STATUS_CHANGED,
                $"A tarefa \"{task.Title}\" foi movida para {StatusLabel(toStatus)}.");
        }
    }

    private async Task Add(TaskItem task, long recipientId, string type, string message)
    {
        await _repository.Create(new Notification
        {
            UserId = recipientId,
            Type = type,
            Message = message.Length <= MaxMessageLength ? message : message[..MaxMessageLength],
            TaskItem = task,
            CreatedAt = DateTime.UtcNow
        });
    }

    private static string StatusLabel(string status) => status switch
    {
        TaskStatuses.BACKLOG => "Backlog",
        TaskStatuses.TODO => "A Fazer",
        TaskStatuses.IN_PROGRESS => "Em Progresso",
        TaskStatuses.IN_REVIEW => "Em Revisão",
        TaskStatuses.DONE => "Concluído",
        _ => status
    };
}
