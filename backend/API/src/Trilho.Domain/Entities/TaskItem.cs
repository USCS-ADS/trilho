using Trilho.Domain.Enum;

namespace Trilho.Domain.Entities;
/// <summary>Tarefa do Kanban. O <see cref="Id"/> é o número exibido (#128).</summary>
public class TaskItem
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = TaskStatuses.BACKLOG;
    public string Priority { get; set; } = TaskPriorities.MEDIUM;
    public long TeamId { get; set; }
    public long? AssigneeId { get; set; }
    public User? Assignee { get; set; }
    public long? CreatedById { get; set; }
    public User? CreatedBy { get; set; }
    public DateOnly? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    /// <summary>Posição dentro da coluna (status) do time.</summary>
    public int Position { get; set; }
    /// <summary>Vínculo Git (RF06): preenchido pelos webhooks do provedor.</summary>
    public string? GitBranch { get; set; }
    public int? PullRequestNumber { get; set; }
    /// <summary>open | merged | closed</summary>
    public string? PullRequestState { get; set; }
    public DateTime? LastCommitAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<Subtask> Subtasks { get; set; } = [];
    public List<TaskComment> Comments { get; set; } = [];
    public List<TaskActivity> Activities { get; set; } = [];

    public bool HasPendingSubtasks => Subtasks.Exists(subtask => subtask.IsDone == false);

    /// <summary>RF03: prazo vencido e status diferente de concluído.</summary>
    public bool IsOverdue(DateOnly today) => DueDate is not null && DueDate < today && Status != TaskStatuses.DONE;

    public void Record(long? actorId, string type, string? fromValue = null, string? toValue = null)
    {
        Activities.Add(new TaskActivity
        {
            ActorId = actorId,
            Type = type,
            FromValue = fromValue,
            ToValue = toValue,
            CreatedAt = DateTime.UtcNow
        });
    }
}
