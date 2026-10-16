namespace Trilho.Communication.Responses.Tasks;
/// <summary>Cartão do Kanban.</summary>
public class ResponseTaskSummaryJson
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public long TeamId { get; set; }
    public long? AssigneeId { get; set; }
    public DateOnly? DueDate { get; set; }
    public bool IsOverdue { get; set; }
    public int Position { get; set; }
    public int SubtasksTotal { get; set; }
    public int SubtasksDone { get; set; }
    public int CommentCount { get; set; }

    /// <summary>Vínculo Git (RF06), para as tags do cartão.</summary>
    public string? GitBranch { get; set; }
    public int? PullRequestNumber { get; set; }
    public string? PullRequestState { get; set; }
}
