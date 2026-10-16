namespace Trilho.Domain.Entities;
public class Notification
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public long? TaskId { get; set; }
    public TaskItem? TaskItem { get; set; }
    /// <summary>Evita duplicar avisos gerados por job (ex: prazo em 48h da mesma tarefa).</summary>
    public string? DedupKey { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }

    public bool IsRead => ReadAt is not null;
}
