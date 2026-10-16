namespace Trilho.Communication.Requests.PasswordReset;
public class RequestConfirmPasswordResetJson
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
