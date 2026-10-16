using Trilho.Domain.Entities;

namespace Trilho.Application.UseCases.Notifications.Shared;
/// <summary>
/// Gera notificações dos eventos da tarefa (RF08). Apenas adiciona ao contexto: quem chama
/// confirma tudo no mesmo <c>Commit</c> da unidade de trabalho.
/// </summary>
public interface ITaskNotifier
{
    Task Assigned(TaskItem task, long recipientId, long actorId);
    Task StatusChanged(TaskItem task, string? previousStatus, string toStatus, long actorId);
}
