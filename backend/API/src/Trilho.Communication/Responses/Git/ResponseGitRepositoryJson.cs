namespace Trilho.Communication.Responses.Git;
public class ResponseGitRepositoryJson
{
    public long Id { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public long TeamId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? LastSyncAt { get; set; }
    public List<string> Events { get; set; } = [];
    /// <summary>Eventos recebidos que ainda aguardam (re)processamento.</summary>
    public int PendingEvents { get; set; }
    public string WebhookUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

/// <summary>Resposta da conexão: é a única vez em que o segredo do webhook é exibido.</summary>
public class ResponseGitRepositoryCreatedJson : ResponseGitRepositoryJson
{
    public string WebhookSecret { get; set; } = string.Empty;
}
