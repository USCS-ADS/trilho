namespace Trilho.Domain.Enum;
public static class TaskPriorities
{
    public const string LOW = "low";
    public const string MEDIUM = "medium";
    public const string HIGH = "high";
    public const string URGENT = "urgent";

    public static readonly IReadOnlyList<string> All = [LOW, MEDIUM, HIGH, URGENT];

    public static bool IsValid(string? priority)
    {
        return priority is not null && All.Contains(priority);
    }
}
