using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trilho.Domain.Entities;

namespace Trilho.Infrastructure.DataAcess.Configurations;
internal class InviteConfiguration : IEntityTypeConfiguration<Invite>
{
    public void Configure(EntityTypeBuilder<Invite> builder)
    {
        builder.Property(invite => invite.Email).HasMaxLength(256).IsRequired();
        builder.Property(invite => invite.FullName).HasMaxLength(200).IsRequired();
        builder.Property(invite => invite.Role).HasMaxLength(30).IsRequired();
        builder.Property(invite => invite.TokenHash).HasMaxLength(64).IsRequired();

        builder.HasIndex(invite => invite.TokenHash).IsUnique();
        builder.HasIndex(invite => new { invite.Email, invite.TeamId });

        builder.HasOne(invite => invite.Team)
            .WithMany()
            .HasForeignKey(invite => invite.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(invite => invite.InvitedById)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
