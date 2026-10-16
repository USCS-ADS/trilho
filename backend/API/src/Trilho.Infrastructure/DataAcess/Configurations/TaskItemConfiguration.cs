using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Trilho.Domain.Entities;

namespace Trilho.Infrastructure.DataAcess.Configurations;
internal class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.ToTable("Tasks");

        builder.Property(task => task.Title).HasMaxLength(200).IsRequired();
        builder.Property(task => task.Description).HasMaxLength(2000).IsRequired();
        builder.Property(task => task.Status).HasMaxLength(20).IsRequired();
        builder.Property(task => task.Priority).HasMaxLength(20).IsRequired();
        builder.Property(task => task.GitBranch).HasMaxLength(250);
        builder.Property(task => task.PullRequestState).HasMaxLength(20);

        builder.HasIndex(task => new { task.TeamId, task.Status, task.Position });
        builder.HasIndex(task => task.AssigneeId);

        // Time com tarefas não é excluído (a aplicação orienta a arquivar).
        builder.HasOne<Team>()
            .WithMany()
            .HasForeignKey(task => task.TeamId)
            .OnDelete(DeleteBehavior.Restrict);

        // Excluir um usuário não apaga a tarefa nem o histórico: apenas perde o vínculo.
        builder.HasOne(task => task.Assignee)
            .WithMany()
            .HasForeignKey(task => task.AssigneeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(task => task.CreatedBy)
            .WithMany()
            .HasForeignKey(task => task.CreatedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(task => task.Subtasks)
            .WithOne()
            .HasForeignKey(subtask => subtask.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(task => task.Comments)
            .WithOne()
            .HasForeignKey(comment => comment.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(task => task.Activities)
            .WithOne()
            .HasForeignKey(activity => activity.TaskId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
