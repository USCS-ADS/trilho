using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Trilho.Communication.Requests.Git;
using Trilho.Communication.Requests.Tasks;
using Trilho.Communication.Requests.Teams;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Infrastructure.DataAcess;
using static WebApi.Test.TestApi;

namespace WebApi.Test.Git;
public class GitWebhookEndpointsTests : IClassFixture<TrilhoWebApplicationFactory>
{
    private readonly TrilhoWebApplicationFactory _factory;

    public GitWebhookEndpointsTests(TrilhoWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private sealed record Setup(long TeamId, HttpClient Admin, HttpClient Leader, long RepositoryId, string Secret, string FullName);

    private async Task<Setup> Connected(string provider = "github")
    {
        var admin = await Admin(_factory);
        var leader = await CreateUserWithClient(_factory, admin, Roles.LEADER);

        var team = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("Time"), LeaderId = leader.Id });
        var teamId = (await ReadJson(team)).GetProperty("id").GetInt64();

        var fullName = $"trilho/{UniqueName("repo")}";
        var connect = await leader.Client.PostAsJsonAsync("api/GitRepository", new RequestConnectRepositoryJson
        {
            Provider = provider,
            FullName = fullName,
            TeamId = teamId
        });
        Assert.Equal(HttpStatusCode.Created, connect.StatusCode);

        var body = await ReadJson(connect);

        return new Setup(teamId, admin, leader.Client, body.GetProperty("id").GetInt64(), body.GetProperty("webhookSecret").GetString()!, fullName);
    }

    private static async Task<long> CreateTask(HttpClient client, long teamId, string title = "Implementar relatório")
    {
        var response = await client.PostAsJsonAsync("api/Task", new RequestTaskJson { Title = title, TeamId = teamId, Priority = TaskPriorities.MEDIUM });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return (await ReadJson(response)).GetProperty("id").GetInt64();
    }

    private static async Task<HttpResponseMessage> SendGitHub(HttpClient client, long repositoryId, string secret, string eventName, string payload, string? signatureOverride = null)
    {
        var signature = signatureOverride
            ?? "sha256=" + Convert.ToHexString(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(payload))).ToLowerInvariant();

        var request = new HttpRequestMessage(HttpMethod.Post, $"api/GitWebhook/{repositoryId}")
        {
            Content = new StringContent(payload, Encoding.UTF8, "application/json")
        };
        request.Headers.Add("X-GitHub-Event", eventName);
        request.Headers.Add("X-Hub-Signature-256", signature);

        return await client.SendAsync(request);
    }

    private static string PullRequestPayload(string action, string branch, int number, bool merged = false, string title = "Relatório")
        => $$"""
        { "action": "{{action}}", "pull_request": { "number": {{number}}, "title": "{{title}}", "body": "", "merged": {{merged.ToString().ToLowerInvariant()}}, "head": { "ref": "{{branch}}" }, "updated_at": "2026-10-16T10:00:00Z", "merged_at": "2026-10-16T10:00:00Z" } }
        """;

    [Fact]
    public async Task Connect_ReturnsSecretOnce_AndListShowsRepository()
    {
        var s = await Connected();

        var list = await ReadJson(await s.Leader.GetAsync("api/GitRepository"));
        var repo = list.EnumerateArray().Single(r => r.GetProperty("id").GetInt64() == s.RepositoryId);

        Assert.Equal("connected", repo.GetProperty("status").GetString());
        Assert.False(repo.TryGetProperty("webhookSecret", out var secret) && secret.ValueKind == System.Text.Json.JsonValueKind.String && secret.GetString()!.Length > 0);
        Assert.EndsWith($"/api/GitWebhook/{s.RepositoryId}", repo.GetProperty("webhookUrl").GetString());
    }

    [Fact]
    public async Task Connect_DuplicateRepository_IsConflict_AndInvalidNameIsRejected()
    {
        var s = await Connected();

        var duplicate = await s.Leader.PostAsJsonAsync("api/GitRepository", new RequestConnectRepositoryJson { Provider = "github", FullName = s.FullName, TeamId = s.TeamId });
        var invalid = await s.Leader.PostAsJsonAsync("api/GitRepository", new RequestConnectRepositoryJson { Provider = "github", FullName = "sem-barra", TeamId = s.TeamId });
        var badProvider = await s.Leader.PostAsJsonAsync("api/GitRepository", new RequestConnectRepositoryJson { Provider = "bitbucket", FullName = "a/b", TeamId = s.TeamId });

        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, badProvider.StatusCode);
    }

    [Fact]
    public async Task Connect_ByMember_IsForbidden()
    {
        var s = await Connected();
        var member = await CreateUserWithClient(_factory, s.Admin, Roles.USER);
        (await s.Leader.PostAsJsonAsync($"api/Team/{s.TeamId}/member", new RequestTeamMemberJson { UserId = member.Id })).EnsureSuccessStatusCode();

        var response = await member.Client.PostAsJsonAsync("api/GitRepository", new RequestConnectRepositoryJson { Provider = "github", FullName = "x/y", TeamId = s.TeamId });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Webhook_InvalidSignature_IsUnauthorized_AndChangesNothing()
    {
        var s = await Connected();
        var taskId = await CreateTask(s.Leader, s.TeamId);

        var response = await SendGitHub(_factory.CreateClient(), s.RepositoryId, s.Secret, "pull_request",
            PullRequestPayload("opened", $"feature/task-{taskId}", 3), signatureOverride: "sha256=deadbeef");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var task = await ReadJson(await s.Leader.GetAsync($"api/Task/{taskId}"));
        Assert.Equal("backlog", task.GetProperty("status").GetString());
    }

    [Fact]
    public async Task Webhook_UnknownRepository_IsNotFound()
    {
        await _factory.EnsureSeeded();

        var response = await SendGitHub(_factory.CreateClient(), 999999, "x", "ping", "{}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Webhook_PullRequestOpenedThenMerged_MovesTaskToReviewThenDone()
    {
        var s = await Connected();
        var taskId = await CreateTask(s.Leader, s.TeamId);
        var anonymous = _factory.CreateClient();
        var branch = $"feature/task-{taskId}-relatorio";

        var opened = await SendGitHub(anonymous, s.RepositoryId, s.Secret, "pull_request", PullRequestPayload("opened", branch, 12));
        Assert.Equal(HttpStatusCode.Accepted, opened.StatusCode);

        var inReview = await ReadJson(await s.Leader.GetAsync($"api/Task/{taskId}"));
        Assert.Equal("in-review", inReview.GetProperty("status").GetString());
        Assert.Equal(branch, inReview.GetProperty("git").GetProperty("branch").GetString());
        Assert.Equal(12, inReview.GetProperty("git").GetProperty("pullRequest").GetProperty("number").GetInt32());
        Assert.Equal("open", inReview.GetProperty("git").GetProperty("pullRequest").GetProperty("state").GetString());

        var merged = await SendGitHub(anonymous, s.RepositoryId, s.Secret, "pull_request", PullRequestPayload("closed", branch, 12, merged: true));
        Assert.Equal(HttpStatusCode.Accepted, merged.StatusCode);

        var done = await ReadJson(await s.Leader.GetAsync($"api/Task/{taskId}"));
        Assert.Equal("done", done.GetProperty("status").GetString());
        Assert.Equal("merged", done.GetProperty("git").GetProperty("pullRequest").GetProperty("state").GetString());
        Assert.NotEqual(System.Text.Json.JsonValueKind.Null, done.GetProperty("completedAt").ValueKind);

        var activity = await ReadJson(await s.Leader.GetAsync($"api/Task/{taskId}/activity"));
        Assert.Contains(activity.EnumerateArray(), a => a.GetProperty("type").GetString() == "git-pr-merged");
    }

    [Fact]
    public async Task Webhook_Push_UpdatesBranchAndLastCommit_WithoutMovingTask()
    {
        var s = await Connected();
        var taskId = await CreateTask(s.Leader, s.TeamId);
        var payload = $$"""
            { "ref": "refs/heads/feature/task-{{taskId}}", "commits": [ { "message": "wip", "timestamp": "2026-10-16T09:30:00Z" } ] }
            """;

        var response = await SendGitHub(_factory.CreateClient(), s.RepositoryId, s.Secret, "push", payload);
        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);

        var task = await ReadJson(await s.Leader.GetAsync($"api/Task/{taskId}"));
        Assert.Equal("backlog", task.GetProperty("status").GetString());
        Assert.Equal($"feature/task-{taskId}", task.GetProperty("git").GetProperty("branch").GetString());
        Assert.StartsWith("2026-10-16T09:30:00", task.GetProperty("git").GetProperty("lastCommitAt").GetString());
    }

    [Fact]
    public async Task Webhook_Ping_IsAcknowledgedWithNoContent()
    {
        var s = await Connected();

        var response = await SendGitHub(_factory.CreateClient(), s.RepositoryId, s.Secret, "ping", "{\"zen\":\"ok\"}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Webhook_GitLabToken_IsValidated_AndMergeRequestMovesTask()
    {
        var s = await Connected("gitlab");
        var taskId = await CreateTask(s.Leader, s.TeamId);
        var payload = $$"""
            { "object_kind": "merge_request", "object_attributes": { "iid": 4, "title": "Relatório", "description": "", "source_branch": "feature/task-{{taskId}}", "action": "open", "updated_at": "2026-10-16T10:00:00Z" } }
            """;

        async Task<HttpResponseMessage> Send(string token)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"api/GitWebhook/{s.RepositoryId}")
            {
                Content = new StringContent(payload, Encoding.UTF8, "application/json")
            };
            request.Headers.Add("X-Gitlab-Event", "Merge Request Hook");
            request.Headers.Add("X-Gitlab-Token", token);

            return await _factory.CreateClient().SendAsync(request);
        }

        Assert.Equal(HttpStatusCode.Unauthorized, (await Send("token-errado")).StatusCode);
        Assert.Equal(HttpStatusCode.Accepted, (await Send(s.Secret)).StatusCode);

        var task = await ReadJson(await s.Leader.GetAsync($"api/Task/{taskId}"));
        Assert.Equal("in-review", task.GetProperty("status").GetString());
    }

    [Fact]
    public async Task UpdateEvents_DisablingPullRequests_StopsTaskMoves()
    {
        var s = await Connected();
        var taskId = await CreateTask(s.Leader, s.TeamId);

        var update = await s.Leader.PutAsJsonAsync($"api/GitRepository/{s.RepositoryId}", new RequestUpdateRepositoryJson { Events = ["commit"] });
        Assert.Equal(HttpStatusCode.NoContent, update.StatusCode);

        var response = await SendGitHub(_factory.CreateClient(), s.RepositoryId, s.Secret, "pull_request",
            PullRequestPayload("opened", $"feature/task-{taskId}", 5));
        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);

        var task = await ReadJson(await s.Leader.GetAsync($"api/Task/{taskId}"));
        Assert.Equal("backlog", task.GetProperty("status").GetString());
    }

    [Fact]
    public async Task Disconnect_RemovesRepository_AndWebhookBecomesNotFound()
    {
        var s = await Connected();

        var delete = await s.Leader.DeleteAsync($"api/GitRepository/{s.RepositoryId}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        var response = await SendGitHub(_factory.CreateClient(), s.RepositoryId, s.Secret, "ping", "{}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task FailedEvent_StaysInQueue_MarksRepositoryAsError_AndRetryReportsIt()
    {
        var s = await Connected();

        // Evento corrompido já gravado na fila: o processamento falha (JSON inválido) e fica pendente.
        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<TrilhoDbContext>();
            context.PendingGitEvents.Add(new PendingGitEvent { RepositoryId = s.RepositoryId, EventType = "push", Payload = "{ nao e json" });
            await context.SaveChangesAsync();
        }

        var retry = await ReadJson(await s.Leader.PostAsync($"api/GitRepository/{s.RepositoryId}/retry", null));
        Assert.Equal(1, retry.GetProperty("failed").GetInt32());
        Assert.Equal(0, retry.GetProperty("processed").GetInt32());

        var list = await ReadJson(await s.Leader.GetAsync("api/GitRepository"));
        var repo = list.EnumerateArray().Single(r => r.GetProperty("id").GetInt64() == s.RepositoryId);
        Assert.Equal("error", repo.GetProperty("status").GetString());
        Assert.Equal(1, repo.GetProperty("pendingEvents").GetInt32());
    }

    [Fact]
    public async Task Retry_WithNothingPending_ReturnsZeros()
    {
        var s = await Connected();

        var response = await s.Leader.PostAsync($"api/GitRepository/{s.RepositoryId}/retry", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadJson(response);
        Assert.Equal(0, body.GetProperty("processed").GetInt32());
        Assert.Equal(0, body.GetProperty("failed").GetInt32());
    }
}
