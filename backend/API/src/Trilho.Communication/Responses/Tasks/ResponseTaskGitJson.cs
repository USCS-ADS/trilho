namespace Trilho.Communication.Responses.Tasks;
public class ResponseTaskGitJson
{
    public string Branch { get; set; } = string.Empty;
    public ResponseTaskPullRequestJson? PullRequest { get; set; }
    public DateTime? LastCommitAt { get; set; }
}

public class ResponseTaskPullRequestJson
{
    public int Number { get; set; }
    /// <summary>open | merged | closed</summary>
    public string State { get; set; } = string.Empty;
}
