namespace Trilho.Communication.Responses.Tasks;
public class ResponseActivityJson
{
    public long Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public long? ActorId { get; set; }
    public string ActorName { get; set; } = string.Empty;
    public string? FromValue { get; set; }
    public string? ToValue { get; set; }
    public DateTime CreatedAt { get; set; }
}
