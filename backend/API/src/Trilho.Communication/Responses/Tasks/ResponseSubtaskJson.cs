namespace Trilho.Communication.Responses.Tasks;
public class ResponseSubtaskJson
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsDone { get; set; }
    public long? AssigneeId { get; set; }
}
