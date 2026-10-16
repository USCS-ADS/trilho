namespace Trilho.Domain.Entities;
public class TeamMember
{
    public long TeamId { get; set; }
    public long UserId { get; set; }
    public User? User { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
