namespace Trilho.Communication.Responses.Notifications;
public class ResponseNotificationJson
{
    public long Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public long? TaskId { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}
