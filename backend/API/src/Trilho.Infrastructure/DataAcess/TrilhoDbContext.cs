using Trilho.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Trilho.Infrastructure.DataAcess;
internal class TrilhoDbContext : DbContext
{
    public TrilhoDbContext(DbContextOptions options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<TeamMember> TeamMembers { get; set; }
    public DbSet<TaskItem> Tasks { get; set; }
    public DbSet<Subtask> Subtasks { get; set; }
    public DbSet<TaskComment> TaskComments { get; set; }
    public DbSet<TaskActivity> TaskActivities { get; set; }
    public DbSet<Invite> Invites { get; set; }
    public DbSet<PasswordResetRequest> PasswordResetRequests { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<GitRepository> GitRepositories { get; set; }
    public DbSet<PendingGitEvent> PendingGitEvents { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TrilhoDbContext).Assembly);
    }
}
