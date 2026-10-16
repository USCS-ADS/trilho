namespace Trilho.Domain.Enum;
/// <summary>Eventos que o webhook do Trilho escuta, configuráveis por repositório (RF06).</summary>
public static class GitEventTypes
{
    public const string COMMIT = "commit";
    public const string PULL_REQUEST = "pull_request";
    public const string MERGE = "merge";

    public static readonly IReadOnlyList<string> All = [COMMIT, PULL_REQUEST, MERGE];

    public static bool IsValid(string? eventType) => eventType is not null && All.Contains(eventType);
}
