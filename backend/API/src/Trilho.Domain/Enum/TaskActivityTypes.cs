namespace Trilho.Domain.Enum;
/// <summary>Tipos do histórico de alterações da tarefa (RF05).</summary>
public static class TaskActivityTypes
{
    public const string CREATED = "created";
    public const string UPDATED = "updated";
    public const string STATUS_CHANGED = "status-changed";
    public const string PRIORITY_CHANGED = "priority-changed";
    public const string ASSIGNEE_CHANGED = "assignee-changed";
    public const string DUE_DATE_CHANGED = "due-date-changed";
    public const string COMMENT_ADDED = "comment-added";
    public const string SUBTASK_ADDED = "subtask-added";
    public const string SUBTASK_COMPLETED = "subtask-completed";
    public const string SUBTASK_REOPENED = "subtask-reopened";
    public const string GIT_PR_OPENED = "git-pr-opened";
    public const string GIT_PR_MERGED = "git-pr-merged";
    public const string GIT_PR_CLOSED = "git-pr-closed";
}
