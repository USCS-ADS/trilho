using Trilho.Domain.Enum;

namespace Trilho.Domain.Entities;
/// <summary>Repositório conectado a um time. O segredo do webhook é guardado cifrado (nunca devolvido depois da criação).</summary>
public class GitRepository
{
    public long Id { get; set; }
    public string Provider { get; set; } = string.Empty;
    /// <summary>"dono/repositório", como aparece no provedor.</summary>
    public string FullName { get; set; } = string.Empty;
    public long TeamId { get; set; }
    public string Status { get; set; } = GitSyncStatuses.CONNECTED;
    public DateTime? LastSyncAt { get; set; }
    /// <summary>Eventos habilitados, separados por vírgula (ver <see cref="GitEventTypes"/>).</summary>
    public string Events { get; set; } = string.Join(',', GitEventTypes.All);
    public string WebhookSecretProtected { get; set; } = string.Empty;
    public long? ConnectedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public IReadOnlyList<string> EventList =>
        Events.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    public bool Listens(string eventType) => EventList.Contains(eventType);
}
