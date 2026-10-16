using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trilho.Domain.Entities;

namespace Trilho.Infrastructure.DataAcess.Configurations;
internal class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.Property(notification => notification.Type).HasMaxLength(40).IsRequired();
        builder.Property(notification => notification.Message).HasMaxLength(300).IsRequired();
        builder.Property(notification => notification.DedupKey).HasMaxLength(100);

        builder.HasIndex(notification => new { notification.UserId, notification.ReadAt, notification.CreatedAt });
        builder.HasIndex(notification => new { notification.UserId, notification.DedupKey }).IsUnique();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(notification => notification.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(notification => notification.TaskItem)
            .WithMany()
            .HasForeignKey(notification => notification.TaskId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
