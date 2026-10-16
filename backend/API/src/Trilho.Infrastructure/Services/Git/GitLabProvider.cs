using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Trilho.Domain.Enum;
using Trilho.Domain.Services.Git;

namespace Trilho.Infrastructure.Services.Git;
internal class GitLabProvider : IGitProvider
{
    public string Name => GitProviders.GITLAB;

    public bool IsSignatureValid(string secret, IReadOnlyDictionary<string, string> headers, byte[] body)
    {
        // O GitLab envia o próprio segredo no cabeçalho X-Gitlab-Token.
        if (headers.TryGetValue("X-Gitlab-Token", out var token) == false)
        {
            return false;
        }

        return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(token));
    }

    public string? ExtractEventType(IReadOnlyDictionary<string, string> headers)
    {
        return headers.TryGetValue("X-Gitlab-Event", out var eventType) ? eventType : null;
    }

    public GitEvent? Parse(string eventType, string payload)
    {
        using var document = JsonDocument.Parse(payload);
        var root = document.RootElement;

        return GetString(root, "object_kind") switch
        {
            "push" => ParsePush(root),
            "merge_request" => ParseMergeRequest(root),
            _ => null
        };
    }

    private static GitEvent? ParsePush(JsonElement root)
    {
        var reference = GetString(root, "ref");

        if (reference is null || reference.StartsWith("refs/heads/") == false)
        {
            return null;
        }

        var messages = new List<string>();
        DateTime? occurredAt = null;

        if (root.TryGetProperty("commits", out var commits) && commits.ValueKind == JsonValueKind.Array)
        {
            foreach (var commit in commits.EnumerateArray())
            {
                if (GetString(commit, "message") is { } message)
                {
                    messages.Add(message);
                }

                occurredAt = ParseDate(GetString(commit, "timestamp")) ?? occurredAt;
            }
        }

        return new GitEvent(GitEventKind.Commit, reference["refs/heads/".Length..], null, null, null, messages, occurredAt ?? DateTime.UtcNow);
    }

    private static GitEvent? ParseMergeRequest(JsonElement root)
    {
        if (root.TryGetProperty("object_attributes", out var attributes) == false)
        {
            return null;
        }

        var kind = GetString(attributes, "action") switch
        {
            "open" or "reopen" => GitEventKind.PullRequestOpened,
            "update" => GitEventKind.PullRequestUpdated,
            "merge" => GitEventKind.PullRequestMerged,
            "close" => GitEventKind.PullRequestClosed,
            _ => (GitEventKind?)null
        };

        if (kind is null)
        {
            return null;
        }

        var number = attributes.TryGetProperty("iid", out var iid) && iid.TryGetInt32(out var parsed) ? parsed : (int?)null;

        return new GitEvent(
            kind.Value,
            GetString(attributes, "source_branch") ?? string.Empty,
            number,
            GetString(attributes, "title"),
            GetString(attributes, "description"),
            [],
            ParseDate(GetString(attributes, "updated_at")) ?? DateTime.UtcNow);
    }

    private static string? GetString(JsonElement element, string name)
    {
        return element.ValueKind == JsonValueKind.Object && element.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;
    }

    private static DateTime? ParseDate(string? value)
    {
        return DateTimeOffset.TryParse(value, out var date) ? date.UtcDateTime : null;
    }
}
