using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trilho.Domain.Entities;

namespace Trilho.Infrastructure.DataAcess.Configurations;
internal class TaskActivityConfiguration : IEntityTypeConfiguration<TaskActivity>
{
    public void Configure(EntityTypeBuilder<TaskActivity> builder)
    {
        builder.Property(activity => activity.Type).HasMaxLength(40).IsRequired();
        builder.Property(activity => activity.FromValue).HasMaxLength(100);
        builder.Property(activity => activity.ToValue).HasMaxLength(100);

        builder.HasIndex(activity => new { activity.TaskId, activity.CreatedAt });

        builder.HasOne(activity => activity.Actor)
            .WithMany()
            .HasForeignKey(activity => activity.ActorId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
