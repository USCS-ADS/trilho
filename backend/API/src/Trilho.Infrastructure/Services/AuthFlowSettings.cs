using Microsoft.Extensions.Configuration;
using Trilho.Domain.Services.Settings;

namespace Trilho.Infrastructure.Services;
internal class AuthFlowSettings : IAuthFlowSettings
{
    private readonly string _frontendBaseUrl;

    public AuthFlowSettings(IConfiguration configuration)
    {
        InviteExpiresDays = configuration.GetValue<int?>("Settings:Invite:ExpiresDays") ?? 7;
        PasswordResetExpiresMinutes = configuration.GetValue<int?>("Settings:PasswordReset:ExpiresMinutes") ?? 15;
        PasswordResetMaxAttempts = configuration.GetValue<int?>("Settings:PasswordReset:MaxAttempts") ?? 5;
        LoginMaxFailedAttempts = Math.Max(1, configuration.GetValue<int?>("Settings:Login:MaxFailedAttempts") ?? 5);
        LoginLockoutMinutes = Math.Max(1, configuration.GetValue<int?>("Settings:Login:LockoutMinutes") ?? 15);
        _frontendBaseUrl = (configuration.GetValue<string>("Settings:FrontendBaseUrl") ?? "http://localhost:3000").TrimEnd('/');
    }

    public int InviteExpiresDays { get; }
    public int PasswordResetExpiresMinutes { get; }
    public int PasswordResetMaxAttempts { get; }
    public int LoginMaxFailedAttempts { get; }
    public int LoginLockoutMinutes { get; }

    public string BuildActivationLink(string token)
    {
        return $"{_frontendBaseUrl}/activate-account?token={Uri.EscapeDataString(token)}";
    }
}
