using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trilho.Domain.Entities;

namespace Trilho.Infrastructure.DataAcess.Configurations;
internal class TeamConfiguration : IEntityTypeConfiguration<Team>
{
    public void Configure(EntityTypeBuilder<Team> builder)
    {
        builder.Property(team => team.Name).HasMaxLength(100).IsRequired();
        builder.Property(team => team.Description).HasMaxLength(500).IsRequired();

        builder.HasIndex(team => team.Name).IsUnique();

        // A unicidade "líder de um time ativo por vez" é regra de aplicação (times arquivados mantêm o líder).
        builder.HasIndex(team => team.LeaderId);

        builder.HasOne(team => team.Leader)
            .WithMany()
            .HasForeignKey(team => team.LeaderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(team => team.Members)
            .WithOne()
            .HasForeignKey(member => member.TeamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
