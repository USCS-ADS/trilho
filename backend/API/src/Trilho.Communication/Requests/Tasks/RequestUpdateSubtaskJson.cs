namespace Trilho.Communication.Requests.Tasks;
public class RequestUpdateSubtaskJson
{
    public string Title { get; set; } = string.Empty;
    public bool IsDone { get; set; }
    public long? AssigneeId { get; set; }
}
