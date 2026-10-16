using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trilho.Domain.Entities;

namespace Trilho.Infrastructure.DataAcess.Configurations;
internal class PendingGitEventConfiguration : IEntityTypeConfiguration<PendingGitEvent>
{
    public void Configure(EntityTypeBuilder<PendingGitEvent> builder)
    {
        builder.Property(gitEvent => gitEvent.EventType).HasMaxLength(60).IsRequired();
        builder.Property(gitEvent => gitEvent.Payload).IsRequired();
        builder.Property(gitEvent => gitEvent.LastError).HasMaxLength(500);

        builder.HasIndex(gitEvent => new { gitEvent.ProcessedAt, gitEvent.RepositoryId });

        builder.HasOne<GitRepository>()
            .WithMany()
            .HasForeignKey(gitEvent => gitEvent.RepositoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
