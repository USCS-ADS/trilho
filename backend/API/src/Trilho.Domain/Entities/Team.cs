using Trilho.Domain.Enum;

namespace Trilho.Domain.Entities;
public class Team
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public long LeaderId { get; set; }
    public User? Leader { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<TeamMember> Members { get; set; } = [];

    public bool HasMember(long userId) => Members.Exists(member => member.UserId == userId);

    /// <summary>RF02: administradores e o líder do próprio time gerenciam membros e dados do time.</summary>
    public bool CanBeManagedBy(User user) => user.Role == Roles.ADMIN || LeaderId == user.Id;
}
