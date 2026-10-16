namespace Trilho.Domain.Enum;
public static class GitProviders
{
    public const string GITHUB = "github";
    public const string GITLAB = "gitlab";

    public static readonly IReadOnlyList<string> All = [GITHUB, GITLAB];

    public static bool IsValid(string? provider) => provider is not null && All.Contains(provider);
}
