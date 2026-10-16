namespace Trilho.Domain.Services.Git;

public enum GitEventKind
{
    Commit,
    PullRequestOpened,
    PullRequestUpdated,
    PullRequestMerged,
    PullRequestClosed
}

/// <summary>Evento do provedor já normalizado, independente de GitHub/GitLab.</summary>
public record GitEvent(
    GitEventKind Kind,
    string Branch,
    int? PullRequestNumber,
    string? Title,
    string? Body,
    IReadOnlyList<string> CommitMessages,
    DateTime OccurredAt);

/// <summary>
/// Um provedor Git (GitHub, GitLab...). Novo provedor = nova implementação (OCP), sem alterar os casos de uso.
/// </summary>
public interface IGitProvider
{
    string Name { get; }

    /// <summary>Confere a assinatura/token do webhook contra o segredo do repositório.</summary>
    bool IsSignatureValid(string secret, IReadOnlyDictionary<string, string> headers, byte[] body);

    /// <summary>Tipo do evento informado pelos cabeçalhos, ou nulo se ausente.</summary>
    string? ExtractEventType(IReadOnlyDictionary<string, string> headers);

    /// <summary>Normaliza o payload. Nulo = evento sem interesse para o Trilho (ping, tags, etc.).</summary>
    GitEvent? Parse(string eventType, string payload);
}
