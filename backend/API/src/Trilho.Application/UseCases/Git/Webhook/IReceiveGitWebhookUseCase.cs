namespace Trilho.Application.UseCases.Git.Webhook;

/// <param name="PendingEventId">Id do evento gravado na fila; nulo quando o evento foi ignorado (ping, evento desabilitado...).</param>
public record GitWebhookReceipt(long? PendingEventId);

public interface IReceiveGitWebhookUseCase
{
    Task<GitWebhookReceipt> Execute(long repositoryId, IReadOnlyDictionary<string, string> headers, byte[] body);
}
