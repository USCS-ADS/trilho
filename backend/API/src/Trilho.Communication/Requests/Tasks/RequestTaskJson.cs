namespace Trilho.Communication.Requests.Tasks;
public class RequestTaskJson
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public long TeamId { get; set; }
    public long? AssigneeId { get; set; }
    public DateOnly? DueDate { get; set; }
    public string Priority { get; set; } = string.Empty;
    /// <summary>Opcional: padrão "backlog".</summary>
    public string? Status { get; set; }
}
