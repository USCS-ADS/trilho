namespace Trilho.Domain.Entities;
public class TaskComment
{
    public long Id { get; set; }
    public long TaskId { get; set; }
    public long? AuthorId { get; set; }
    public User? Author { get; set; }
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
