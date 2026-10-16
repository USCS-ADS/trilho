using System.Net;
using System.Net.Http.Json;
using Trilho.Communication.Requests.Prioritization;
using Trilho.Communication.Requests.Tasks;
using Trilho.Communication.Requests.Teams;
using Trilho.Domain.Enum;
using static WebApi.Test.TestApi;

namespace WebApi.Test.Prioritization;
public class PrioritizationEndpointsTests : IClassFixture<TrilhoWebApplicationFactory>
{
    private readonly TrilhoWebApplicationFactory _factory;

    public PrioritizationEndpointsTests(TrilhoWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<(long TeamId, HttpClient Admin, (long Id, HttpClient Client) Leader, (long Id, HttpClient Client) Member)> Scenario()
    {
        var admin = await Admin(_factory);
        var leader = await CreateUserWithClient(_factory, admin, Roles.LEADER);
        var member = await CreateUserWithClient(_factory, admin, Roles.USER);

        var created = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("Time"), LeaderId = leader.Id });
        var teamId = (await ReadJson(created)).GetProperty("id").GetInt64();
        (await leader.Client.PostAsJsonAsync($"api/Team/{teamId}/member", new RequestTeamMemberJson { UserId = member.Id })).EnsureSuccessStatusCode();

        return (teamId, admin, leader, member);
    }

    private static async Task<long> CreateTask(HttpClient client, long teamId, string title, string priority, DateOnly? due = null, long? assignee = null)
    {
        var response = await client.PostAsJsonAsync("api/Task", new RequestTaskJson
        {
            Title = title,
            TeamId = teamId,
            Priority = priority,
            DueDate = due,
            AssigneeId = assignee
        });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return (await ReadJson(response)).GetProperty("id").GetInt64();
    }

    private static DateOnly InDays(int days) => DateOnly.FromDateTime(DateTime.UtcNow.AddDays(days));

    [Fact]
    public async Task Ranking_PutsDeclaredUrgentOnTop_AndExplainsEachTask()
    {
        var s = await Scenario();
        var overdue = await CreateTask(s.Leader.Client, s.TeamId, "Atrasada", TaskPriorities.LOW, InDays(-3), s.Member.Id);
        var urgent = await CreateTask(s.Leader.Client, s.TeamId, "Urgente declarada", TaskPriorities.URGENT, InDays(40));
        var later = await CreateTask(s.Leader.Client, s.TeamId, "Mais tarde", TaskPriorities.MEDIUM, InDays(30));

        var response = await s.Member.Client.GetAsync($"api/Prioritization/ranking?teamId={s.TeamId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var ranking = await ReadJson(response);

        var ids = ranking.EnumerateArray().Select(r => r.GetProperty("taskId").GetInt64()).ToList();
        Assert.Equal([urgent, overdue, later], ids);
        Assert.Equal(1, ranking[0].GetProperty("rank").GetInt32());
        Assert.Equal("urgent", ranking[1].GetProperty("suggestedPriority").GetString());
        Assert.All(ranking.EnumerateArray(), r => Assert.False(string.IsNullOrWhiteSpace(r.GetProperty("justification").GetString())));
    }

    [Fact]
    public async Task Ranking_ForeignTeam_IsForbidden()
    {
        var s = await Scenario();
        var outsider = await CreateUserWithClient(_factory, s.Admin, Roles.USER);

        var response = await outsider.Client.GetAsync($"api/Prioritization/ranking?teamId={s.TeamId}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Suggest_ReturnsPriorityByDeadline_AndMemberWithFewestOpenTasks()
    {
        var s = await Scenario();
        // O líder fica com uma tarefa em aberto; o membro, com nenhuma.
        await CreateTask(s.Leader.Client, s.TeamId, "Do líder", TaskPriorities.MEDIUM, null, s.Leader.Id);

        var response = await s.Leader.Client.PostAsJsonAsync("api/Prioritization/suggest", new RequestSuggestionJson { TeamId = s.TeamId, DueDate = InDays(3) });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadJson(response);
        Assert.Equal("high", body.GetProperty("priority").GetString());
        Assert.Equal(s.Member.Id, body.GetProperty("suggestedAssignee").GetProperty("userId").GetInt64());
        Assert.Equal(0, body.GetProperty("suggestedAssignee").GetProperty("openTasks").GetInt32());
    }

    [Fact]
    public async Task Apply_UpdatesPriorities_KeepsUrgentDeclared_AndRecordsActivity()
    {
        var s = await Scenario();
        var soon = await CreateTask(s.Leader.Client, s.TeamId, "Perto do prazo", TaskPriorities.LOW, InDays(2));
        var urgent = await CreateTask(s.Leader.Client, s.TeamId, "Urgente", TaskPriorities.URGENT, InDays(50));
        var matching = await CreateTask(s.Leader.Client, s.TeamId, "Já correta", TaskPriorities.MEDIUM, null);

        var response = await s.Leader.Client.PostAsJsonAsync("api/Prioritization/apply", new RequestApplyRankingJson { TeamId = s.TeamId });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadJson(response);
        Assert.Equal(1, body.GetProperty("updated").GetInt32());
        Assert.Equal(soon, body.GetProperty("changes")[0].GetProperty("taskId").GetInt64());

        var updated = await ReadJson(await s.Leader.Client.GetAsync($"api/Task/{soon}"));
        Assert.Equal("high", updated.GetProperty("priority").GetString());

        var untouched = await ReadJson(await s.Leader.Client.GetAsync($"api/Task/{urgent}"));
        Assert.Equal("urgent", untouched.GetProperty("priority").GetString());

        var activity = await ReadJson(await s.Leader.Client.GetAsync($"api/Task/{soon}/activity"));
        Assert.Contains(activity.EnumerateArray(), a => a.GetProperty("type").GetString() == "priority-changed");

        // Segunda aplicação não altera nada.
        var again = await ReadJson(await s.Leader.Client.PostAsJsonAsync("api/Prioritization/apply", new RequestApplyRankingJson { TeamId = s.TeamId }));
        Assert.Equal(0, again.GetProperty("updated").GetInt32());
        Assert.Equal("medium", (await ReadJson(await s.Leader.Client.GetAsync($"api/Task/{matching}"))).GetProperty("priority").GetString());
    }

    [Fact]
    public async Task Apply_ByMember_IsForbidden_AndByOtherTeamsLeader_IsForbidden()
    {
        var s = await Scenario();
        var otherLeader = await CreateUserWithClient(_factory, s.Admin, Roles.LEADER);

        var byMember = await s.Member.Client.PostAsJsonAsync("api/Prioritization/apply", new RequestApplyRankingJson { TeamId = s.TeamId });
        var byOther = await otherLeader.Client.PostAsJsonAsync("api/Prioritization/apply", new RequestApplyRankingJson { TeamId = s.TeamId });

        Assert.Equal(HttpStatusCode.Forbidden, byMember.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, byOther.StatusCode);
    }
}
