namespace Trilho.Communication.Requests.Git;
public class RequestConnectRepositoryJson
{
    public string Provider { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public long TeamId { get; set; }
    /// <summary>Opcional: padrão = commit, pull_request e merge.</summary>
    public List<string>? Events { get; set; }
}
