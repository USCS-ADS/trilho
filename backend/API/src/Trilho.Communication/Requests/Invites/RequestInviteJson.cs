namespace Trilho.Communication.Requests.Invites;
public class RequestInviteJson
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public long TeamId { get; set; }
    public string Role { get; set; } = string.Empty;
}
