namespace Trilho.Domain.Enum;
public static class TaskStatuses
{
    public const string BACKLOG = "backlog";
    public const string TODO = "todo";
    public const string IN_PROGRESS = "in-progress";
    public const string IN_REVIEW = "in-review";
    public const string DONE = "done";

    public static readonly IReadOnlyList<string> All = [BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE];

    public static bool IsValid(string? status)
    {
        return status is not null && All.Contains(status);
    }
}
