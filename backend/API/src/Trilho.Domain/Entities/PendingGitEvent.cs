namespace Trilho.Domain.Entities;
/// <summary>
/// Evento recebido do provedor. É gravado antes de ser processado; se o processamento falhar,
/// fica na fila e é reprocessado (RF06).
/// </summary>
public class PendingGitEvent
{
    public long Id { get; set; }
    public long RepositoryId { get; set; }
    /// <summary>Tipo do evento como enviado pelo provedor (ex: "push", "pull_request").</summary>
    public string EventType { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public int Attempts { get; set; }
    public string? LastError { get; set; }
}
