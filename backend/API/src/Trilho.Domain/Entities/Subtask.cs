namespace Trilho.Domain.Entities;
public class Subtask
{
    public long Id { get; set; }
    public long TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsDone { get; set; }
    public long? AssigneeId { get; set; }
}
