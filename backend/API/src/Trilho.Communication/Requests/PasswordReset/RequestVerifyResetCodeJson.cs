namespace Trilho.Communication.Requests.PasswordReset;
public class RequestVerifyResetCodeJson
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}
