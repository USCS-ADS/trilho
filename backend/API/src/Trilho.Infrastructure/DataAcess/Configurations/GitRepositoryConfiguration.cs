using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trilho.Domain.Entities;

namespace Trilho.Infrastructure.DataAcess.Configurations;
internal class GitRepositoryConfiguration : IEntityTypeConfiguration<GitRepository>
{
    public void Configure(EntityTypeBuilder<GitRepository> builder)
    {
        builder.Property(repository => repository.Provider).HasMaxLength(20).IsRequired();
        builder.Property(repository => repository.FullName).HasMaxLength(200).IsRequired();
        builder.Property(repository => repository.Status).HasMaxLength(20).IsRequired();
        builder.Property(repository => repository.Events).HasMaxLength(100).IsRequired();
        builder.Property(repository => repository.WebhookSecretProtected).HasMaxLength(1000).IsRequired();

        builder.HasIndex(repository => new { repository.Provider, repository.FullName }).IsUnique();
        builder.HasIndex(repository => repository.TeamId);

        builder.HasOne<Team>()
            .WithMany()
            .HasForeignKey(repository => repository.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(repository => repository.ConnectedById)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
