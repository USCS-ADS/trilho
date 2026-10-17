namespace Trilho.Domain.Entities;
public class User
{
    public long Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role {  get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    /// <summary>Senhas erradas seguidas desde o último login válido (zera ao entrar, ao bloquear e ao redefinir a senha).</summary>
    public int FailedLoginAttempts { get; set; }

    /// <summary>Enquanto estiver no futuro (UTC), o login da conta é recusado, mesmo com a senha certa.</summary>
    public DateTime? LockoutEnd { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
