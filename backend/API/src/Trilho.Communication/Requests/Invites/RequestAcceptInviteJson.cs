namespace Trilho.Communication.Requests.Invites;
public class RequestAcceptInviteJson
{
    public string Token { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
