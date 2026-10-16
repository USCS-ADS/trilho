namespace Trilho.Communication.Requests.Tasks;
public class RequestUpdateTaskJson
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public long? AssigneeId { get; set; }
    public DateOnly? DueDate { get; set; }
    public string Priority { get; set; } = string.Empty;
}
