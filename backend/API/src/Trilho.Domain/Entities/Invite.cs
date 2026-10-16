namespace Trilho.Domain.Entities;
/// <summary>Convite por e-mail (RF01: não há autocadastro). O token em si nunca é persistido, apenas o hash.</summary>
public class Invite
{
    public long Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public long TeamId { get; set; }
    public Team? Team { get; set; }
    public string Role { get; set; } = string.Empty;
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public long? InvitedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsPending(DateTime now) => AcceptedAt is null && CancelledAt is null && ExpiresAt > now;
}
