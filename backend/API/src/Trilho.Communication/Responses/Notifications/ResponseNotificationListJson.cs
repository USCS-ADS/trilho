namespace Trilho.Communication.Responses.Notifications;
public class ResponseNotificationListJson
{
    public int UnreadCount { get; set; }
    public List<ResponseNotificationJson> Notifications { get; set; } = [];
}
