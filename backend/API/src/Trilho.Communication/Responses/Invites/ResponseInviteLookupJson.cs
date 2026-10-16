namespace Trilho.Communication.Responses.Invites;
/// <summary>Dados exibidos na tela de ativação (a partir do token do convite).</summary>
public class ResponseInviteLookupJson
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string TeamName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
