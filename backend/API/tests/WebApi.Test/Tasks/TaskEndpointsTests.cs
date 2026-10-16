using System.Net;
using System.Net.Http.Json;
using Trilho.Communication.Requests.Tasks;
using Trilho.Communication.Requests.Teams;
using Trilho.Domain.Enum;
using static WebApi.Test.TestApi;

namespace WebApi.Test.Tasks;
public class TaskEndpointsTests : IClassFixture<TrilhoWebApplicationFactory>
{
    private readonly TrilhoWebApplicationFactory _factory;

    public TaskEndpointsTests(TrilhoWebApplicationFactory factory)
    {
        _factory = factory;
    }

    /// <summary>Time com um líder e um membro; devolve ids e clientes autenticados de cada um.</summary>
    private async Task<Scenario> BuildScenario()
    {
        var admin = await Admin(_factory);
        var leader = await CreateUserWithClient(_factory, admin, Roles.LEADER);
        var member = await CreateUserWithClient(_factory, admin, Roles.USER);
        var outsider = await CreateUserWithClient(_factory, admin, Roles.USER);

        var created = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("Time"), LeaderId = leader.Id });
        var teamId = (await ReadJson(created)).GetProperty("id").GetInt64();

        var add = await leader.Client.PostAsJsonAsync($"api/Team/{teamId}/member", new RequestTeamMemberJson { UserId = member.Id });
        add.EnsureSuccessStatusCode();

        return new Scenario(admin, teamId, leader.Id, leader.Client, member.Id, member.Client, outsider.Id, outsider.Client);
    }

    private static RequestTaskJson NewTask(long teamId, string title = "Criar endpoint", string priority = TaskPriorities.MEDIUM, long? assigneeId = null)
        => new() { Title = title, Description = "desc", TeamId = teamId, Priority = priority, AssigneeId = assigneeId };

    private static async Task<long> CreateTask(HttpClient client, RequestTaskJson request)
    {
        var response = await client.PostAsJsonAsync("api/Task", request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return (await ReadJson(response)).GetProperty("id").GetInt64();
    }

    [Fact]
    public async Task Create_AsMember_ReturnsTaskInBacklog_AndRecordsCreatedActivity()
    {
        var s = await BuildScenario();

        var response = await s.MemberClient.PostAsJsonAsync("api/Task", NewTask(s.TeamId, assigneeId: s.MemberId));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var task = await ReadJson(response);
        Assert.Equal("backlog", task.GetProperty("status").GetString());
        Assert.Equal(s.MemberId, task.GetProperty("assigneeId").GetInt64());

        var activity = await ReadJson(await s.MemberClient.GetAsync($"api/Task/{task.GetProperty("id").GetInt64()}/activity"));
        Assert.Equal("created", activity[0].GetProperty("type").GetString());
    }

    [Fact]
    public async Task Create_ByNonMember_IsForbidden_AndAssigneeOutsideTeamIsRejected()
    {
        var s = await BuildScenario();

        var forbidden = await s.OutsiderClient.PostAsJsonAsync("api/Task", NewTask(s.TeamId));
        var badAssignee = await s.LeaderClient.PostAsJsonAsync("api/Task", NewTask(s.TeamId, assigneeId: s.OutsiderId));

        Assert.Equal(HttpStatusCode.Forbidden, forbidden.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, badAssignee.StatusCode);
    }

    [Fact]
    public async Task Create_InvalidPriorityAndMissingTitle_ReturnsBadRequest()
    {
        var s = await BuildScenario();

        var response = await s.LeaderClient.PostAsJsonAsync("api/Task", NewTask(s.TeamId, title: "", priority: "banana"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Board_ReturnsOnlyTasksOfUsersTeams_AndMoveReordersColumn()
    {
        var s = await BuildScenario();
        var first = await CreateTask(s.LeaderClient, NewTask(s.TeamId, "A"));
        var second = await CreateTask(s.LeaderClient, NewTask(s.TeamId, "B"));
        var third = await CreateTask(s.LeaderClient, NewTask(s.TeamId, "C"));

        var move = await s.MemberClient.PutAsJsonAsync($"api/Task/{third}/move", new RequestMoveTaskJson { Status = TaskStatuses.BACKLOG, Position = 0 });
        Assert.Equal(HttpStatusCode.NoContent, move.StatusCode);

        var board = await ReadJson(await s.MemberClient.GetAsync($"api/Task?teamId={s.TeamId}"));
        var order = board.EnumerateArray().Select(t => t.GetProperty("id").GetInt64()).ToList();
        Assert.Equal([third, first, second], order);

        // Quem não participa do time não enxerga o quadro dele.
        var outsiderBoard = await s.OutsiderClient.GetAsync($"api/Task?teamId={s.TeamId}");
        Assert.Equal(HttpStatusCode.Forbidden, outsiderBoard.StatusCode);
    }

    [Fact]
    public async Task Move_ToDone_RequiresAllSubtasksDone_AndSetsCompletedAt()
    {
        var s = await BuildScenario();
        var taskId = await CreateTask(s.LeaderClient, NewTask(s.TeamId));

        var subtaskResponse = await s.MemberClient.PostAsJsonAsync($"api/Task/{taskId}/subtask", new RequestSubtaskJson { Title = "Escrever testes" });
        Assert.Equal(HttpStatusCode.Created, subtaskResponse.StatusCode);
        var subtaskId = (await ReadJson(subtaskResponse)).GetProperty("id").GetInt64();

        var blocked = await s.MemberClient.PutAsJsonAsync($"api/Task/{taskId}/move", new RequestMoveTaskJson { Status = TaskStatuses.DONE, Position = 0 });
        Assert.Equal(HttpStatusCode.Conflict, blocked.StatusCode);

        var toggle = await s.MemberClient.PutAsJsonAsync($"api/Task/{taskId}/subtask/{subtaskId}", new RequestUpdateSubtaskJson { Title = "Escrever testes", IsDone = true });
        Assert.Equal(HttpStatusCode.NoContent, toggle.StatusCode);

        var done = await s.MemberClient.PutAsJsonAsync($"api/Task/{taskId}/move", new RequestMoveTaskJson { Status = TaskStatuses.DONE, Position = 0 });
        Assert.Equal(HttpStatusCode.NoContent, done.StatusCode);

        var detail = await ReadJson(await s.MemberClient.GetAsync($"api/Task/{taskId}"));
        Assert.Equal("done", detail.GetProperty("status").GetString());
        Assert.Equal(100, detail.GetProperty("progress").GetInt32());
        Assert.NotEqual(System.Text.Json.JsonValueKind.Null, detail.GetProperty("completedAt").ValueKind);

        // Concluída: não aceita subtarefa pendente nova nem reabertura.
        var addAfterDone = await s.MemberClient.PostAsJsonAsync($"api/Task/{taskId}/subtask", new RequestSubtaskJson { Title = "Outra" });
        Assert.Equal(HttpStatusCode.Conflict, addAfterDone.StatusCode);

        var activity = await ReadJson(await s.MemberClient.GetAsync($"api/Task/{taskId}/activity"));
        var types = activity.EnumerateArray().Select(a => a.GetProperty("type").GetString()).ToList();
        Assert.Contains("status-changed", types);
        Assert.Contains("subtask-completed", types);
    }

    [Fact]
    public async Task Update_ChangesFields_AndRecordsActivity()
    {
        var s = await BuildScenario();
        var taskId = await CreateTask(s.LeaderClient, NewTask(s.TeamId));

        var update = await s.MemberClient.PutAsJsonAsync($"api/Task/{taskId}", new RequestUpdateTaskJson
        {
            Title = "Novo título",
            Description = "nova",
            Priority = TaskPriorities.URGENT,
            AssigneeId = s.MemberId,
            DueDate = new DateOnly(2030, 1, 15)
        });
        Assert.Equal(HttpStatusCode.NoContent, update.StatusCode);

        var detail = await ReadJson(await s.MemberClient.GetAsync($"api/Task/{taskId}"));
        Assert.Equal("Novo título", detail.GetProperty("title").GetString());
        Assert.Equal("urgent", detail.GetProperty("priority").GetString());
        Assert.Equal("2030-01-15", detail.GetProperty("dueDate").GetString());

        var activity = await ReadJson(await s.MemberClient.GetAsync($"api/Task/{taskId}/activity"));
        var types = activity.EnumerateArray().Select(a => a.GetProperty("type").GetString()).ToList();
        Assert.Contains("priority-changed", types);
        Assert.Contains("assignee-changed", types);
        Assert.Contains("due-date-changed", types);
    }

    [Fact]
    public async Task Comments_AuthorOrLeaderCanDelete_OtherMemberCannot()
    {
        var s = await BuildScenario();
        var taskId = await CreateTask(s.LeaderClient, NewTask(s.TeamId));

        // Terceiro membro (autor ≠ quem remove e sem poder de gestão).
        var admin = s.AdminClient;
        var third = await CreateUserWithClient(_factory, admin, Roles.USER);
        (await s.LeaderClient.PostAsJsonAsync($"api/Team/{s.TeamId}/member", new RequestTeamMemberJson { UserId = third.Id })).EnsureSuccessStatusCode();

        var created = await s.MemberClient.PostAsJsonAsync($"api/Task/{taskId}/comment", new RequestCommentJson { Body = "Bora!" });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var commentId = (await ReadJson(created)).GetProperty("id").GetInt64();

        var denied = await third.Client.DeleteAsync($"api/Task/{taskId}/comment/{commentId}");
        Assert.Equal(HttpStatusCode.Forbidden, denied.StatusCode);

        var detail = await ReadJson(await s.LeaderClient.GetAsync($"api/Task/{taskId}"));
        Assert.Equal(1, detail.GetProperty("comments").GetArrayLength());

        var byLeader = await s.LeaderClient.DeleteAsync($"api/Task/{taskId}/comment/{commentId}");
        Assert.Equal(HttpStatusCode.NoContent, byLeader.StatusCode);
    }

    [Fact]
    public async Task Delete_OnlyLeaderOrAdmin_AndBlockedWithPendingSubtasks()
    {
        var s = await BuildScenario();
        var taskId = await CreateTask(s.LeaderClient, NewTask(s.TeamId));

        var byMember = await s.MemberClient.DeleteAsync($"api/Task/{taskId}");
        Assert.Equal(HttpStatusCode.Forbidden, byMember.StatusCode);

        await s.MemberClient.PostAsJsonAsync($"api/Task/{taskId}/subtask", new RequestSubtaskJson { Title = "Pendente" });
        var withPending = await s.LeaderClient.DeleteAsync($"api/Task/{taskId}");
        Assert.Equal(HttpStatusCode.Conflict, withPending.StatusCode);

        var other = await CreateTask(s.LeaderClient, NewTask(s.TeamId, "Sem subtarefas"));
        var ok = await s.LeaderClient.DeleteAsync($"api/Task/{other}");
        Assert.Equal(HttpStatusCode.NoContent, ok.StatusCode);
    }

    [Fact]
    public async Task DeleteTeam_WithTasks_IsConflict()
    {
        var s = await BuildScenario();
        await CreateTask(s.LeaderClient, NewTask(s.TeamId));

        var response = await s.AdminClient.DeleteAsync($"api/Team/{s.TeamId}");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task ArchivedTeam_RejectsNewTasks()
    {
        var s = await BuildScenario();
        (await s.AdminClient.PostAsync($"api/Team/{s.TeamId}/archive", null)).EnsureSuccessStatusCode();

        var response = await s.LeaderClient.PostAsJsonAsync("api/Task", NewTask(s.TeamId));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private sealed record Scenario(
        HttpClient AdminClient,
        long TeamId,
        long LeaderId,
        HttpClient LeaderClient,
        long MemberId,
        HttpClient MemberClient,
        long OutsiderId,
        HttpClient OutsiderClient);
}
