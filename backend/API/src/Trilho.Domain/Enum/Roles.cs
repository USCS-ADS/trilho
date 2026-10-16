namespace Trilho.Domain.Enum;
public static class Roles
{
    public const string ADMIN = "administrador";
    public const string LEADER = "lider";
    public const string USER = "user";

    public static readonly IReadOnlyList<string> All = [ADMIN, LEADER, USER];

    public static bool IsValid(string? role)
    {
        return role is not null && All.Contains(role);
    }
}
