namespace Trilho.Domain.Entities;
public class TaskActivity
{
    public long Id { get; set; }
    public long TaskId { get; set; }
    public long? ActorId { get; set; }
    public User? Actor { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? FromValue { get; set; }
    public string? ToValue { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
