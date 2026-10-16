namespace Trilho.Domain.Services.Settings;
/// <summary>Parâmetros dos fluxos de convite e redefinição de senha (vêm da configuração).</summary>
public interface IAuthFlowSettings
{
    int InviteExpiresDays { get; }
    int PasswordResetExpiresMinutes { get; }
    int PasswordResetMaxAttempts { get; }

    /// <summary>Link da tela de ativação de conta, com o token do convite.</summary>
    string BuildActivationLink(string token);
}
