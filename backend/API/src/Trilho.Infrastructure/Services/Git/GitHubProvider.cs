using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Trilho.Domain.Enum;
using Trilho.Domain.Services.Git;

namespace Trilho.Infrastructure.Services.Git;
internal class GitHubProvider : IGitProvider
{
    public string Name => GitProviders.GITHUB;

    public bool IsSignatureValid(string secret, IReadOnlyDictionary<string, string> headers, byte[] body)
    {
        if (headers.TryGetValue("X-Hub-Signature-256", out var header) == false || header.StartsWith("sha256=") == false)
        {
            return false;
        }

        var expected = "sha256=" + Convert.ToHexString(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), body)).ToLowerInvariant();

        return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(header.Trim().ToLowerInvariant()));
    }

    public string? ExtractEventType(IReadOnlyDictionary<string, string> headers)
    {
        return headers.TryGetValue("X-GitHub-Event", out var eventType) ? eventType : null;
    }

    public GitEvent? Parse(string eventType, string payload)
    {
        using var document = JsonDocument.Parse(payload);
        var root = document.RootElement;

        return eventType switch
        {
            "push" => ParsePush(root),
            "pull_request" => ParsePullRequest(root),
            _ => null
        };
    }

    private static GitEvent? ParsePush(JsonElement root)
    {
        // Tags e branches removidos não interessam.
        if (root.TryGetProperty("deleted", out var deleted) && deleted.ValueKind == JsonValueKind.True)
        {
            return null;
        }

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

    private static GitEvent? ParsePullRequest(JsonElement root)
    {
        if (root.TryGetProperty("pull_request", out var pullRequest) == false)
        {
            return null;
        }

        var action = GetString(root, "action");
        var merged = pullRequest.TryGetProperty("merged", out var mergedValue) && mergedValue.ValueKind == JsonValueKind.True;

        var kind = action switch
        {
            "opened" or "reopened" or "ready_for_review" => GitEventKind.PullRequestOpened,
            "synchronize" or "edited" => GitEventKind.PullRequestUpdated,
            "closed" => merged ? GitEventKind.PullRequestMerged : GitEventKind.PullRequestClosed,
            _ => (GitEventKind?)null
        };

        if (kind is null)
        {
            return null;
        }

        var branch = pullRequest.TryGetProperty("head", out var head) ? GetString(head, "ref") : null;
        var number = pullRequest.TryGetProperty("number", out var numberValue) && numberValue.TryGetInt32(out var parsed) ? parsed : (int?)null;
        var occurredAt = ParseDate(GetString(pullRequest, kind == GitEventKind.PullRequestMerged ? "merged_at" : "updated_at"));

        return new GitEvent(
            kind.Value,
            branch ?? string.Empty,
            number,
            GetString(pullRequest, "title"),
            GetString(pullRequest, "body"),
            [],
            occurredAt ?? DateTime.UtcNow);
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
