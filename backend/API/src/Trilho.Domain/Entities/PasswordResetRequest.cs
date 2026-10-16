namespace Trilho.Domain.Entities;
/// <summary>Pedido de redefinição de senha: código de 6 dígitos (apenas o hash), validade curta e limite de tentativas.</summary>
public class PasswordResetRequest
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string CodeHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public int Attempts { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
