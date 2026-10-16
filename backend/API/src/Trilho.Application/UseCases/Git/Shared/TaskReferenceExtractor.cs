using System.Text.RegularExpressions;

namespace Trilho.Application.UseCases.Git.Shared;
/// <summary>
/// Descobre a quais tarefas um evento Git se refere. Convenção documentada para a equipe:
/// citar <c>#128</c>, <c>task-128</c> ou <c>trilho-128</c> na branch, no título/descrição do PR ou na mensagem do commit.
/// </summary>
public static partial class TaskReferenceExtractor
{
    [GeneratedRegex(@"(?:#|\b(?:task|trilho)[-_/ ]?)(\d{1,9})", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant)]
    private static partial Regex ReferencePattern();

    public static IReadOnlyList<long> Extract(IEnumerable<string?> texts)
    {
        var ids = new List<long>();

        foreach (var text in texts)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                continue;
            }

            foreach (Match match in ReferencePattern().Matches(text))
            {
                if (long.TryParse(match.Groups[1].Value, out var id) && id > 0 && ids.Contains(id) == false)
                {
                    ids.Add(id);
                }
            }
        }

        return ids;
    }
}
