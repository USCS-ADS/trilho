using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trilho.Domain.Entities;

namespace Trilho.Infrastructure.DataAcess.Configurations;
internal class SubtaskConfiguration : IEntityTypeConfiguration<Subtask>
{
    public void Configure(EntityTypeBuilder<Subtask> builder)
    {
        builder.Property(subtask => subtask.Title).HasMaxLength(200).IsRequired();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(subtask => subtask.AssigneeId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
