using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using CommonTestUtilities.Requests;
using Trilho.Communication.Requests.Teams;
using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Users;
using Trilho.Domain.Enum;

namespace WebApi.Test.Teams;
public class TeamEndpointsTests : IClassFixture<TrilhoWebApplicationFactory>
{
    private readonly TrilhoWebApplicationFactory _factory;

    public TeamEndpointsTests(TrilhoWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<HttpClient> ClientAs(string email, string password = TrilhoWebApplicationFactory.Password)
    {
        await _factory.EnsureSeeded();

        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = email, Password = password });
        response.EnsureSuccessStatusCode();

        var login = await response.Content.ReadFromJsonAsync<ResponseUserLoginJson>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login!.Token);

        return client;
    }

    private async Task<long> CreateUser(HttpClient admin, string role)
    {
        var request = RequestUserJsonBuilder.Build(role);
        var response = await admin.PostAsJsonAsync("api/User", request);
        response.EnsureSuccessStatusCode();

        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return body.RootElement.GetProperty("id").GetInt64();
    }

    private static async Task<JsonElement> ReadJson(HttpResponseMessage response)
    {
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return document.RootElement.Clone();
    }

    private static string UniqueName(string prefix) => $"{prefix}-{Guid.NewGuid().ToString("N")[..6]}";

    [Fact]
    public async Task Create_AsMember_ReturnsForbidden()
    {
        var member = await ClientAs(TrilhoWebApplicationFactory.MemberEmail);

        var response = await member.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("T"), LeaderId = 1 });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Create_AsAdmin_ReturnsTeamWithLeaderAsMember()
    {
        var admin = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);
        var leaderId = await CreateUser(admin, Roles.LEADER);

        var response = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("Backend"), Description = "APIs", LeaderId = leaderId });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var team = await ReadJson(response);
        Assert.Equal(leaderId, team.GetProperty("leaderId").GetInt64());
        Assert.Equal(1, team.GetProperty("memberCount").GetInt32());
        Assert.Equal(leaderId, team.GetProperty("leader").GetProperty("id").GetInt64());
        Assert.EndsWith("Z", team.GetProperty("createdAt").GetString());
        Assert.Equal(0, team.GetProperty("workloadPercent").GetInt32());
    }

    [Fact]
    public async Task Create_LeaderAlreadyLeadsAnotherTeam_ReturnsConflict()
    {
        var admin = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);
        var leaderId = await CreateUser(admin, Roles.LEADER);

        var first = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("A"), LeaderId = leaderId });
        var second = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("B"), LeaderId = leaderId });

        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task Create_LeaderWithUserRole_ReturnsBadRequest()
    {
        var admin = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);
        var userId = await CreateUser(admin, Roles.USER);

        var response = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("C"), LeaderId = userId });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Members_LeaderCanAddAndRemove_AndOutsiderCannot()
    {
        var admin = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);
        var leaderId = await CreateUser(admin, Roles.LEADER);
        var memberId = await CreateUser(admin, Roles.USER);

        var created = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("D"), LeaderId = leaderId });
        var teamId = (await ReadJson(created)).GetProperty("id").GetInt64();

        var leaderEmail = (await ReadJson(await admin.GetAsync($"api/User/{leaderId}"))).GetProperty("email").GetString()!;
        var leader = await ClientAs(leaderEmail, RequestUserJsonBuilder.ValidPassword);

        var add = await leader.PostAsJsonAsync($"api/Team/{teamId}/member", new RequestTeamMemberJson { UserId = memberId });
        Assert.Equal(HttpStatusCode.NoContent, add.StatusCode);

        var duplicate = await leader.PostAsJsonAsync($"api/Team/{teamId}/member", new RequestTeamMemberJson { UserId = memberId });
        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);

        var detail = await ReadJson(await leader.GetAsync($"api/Team/{teamId}"));
        Assert.Equal(2, detail.GetProperty("memberCount").GetInt32());

        var removeLeader = await leader.DeleteAsync($"api/Team/{teamId}/member/{leaderId}");
        Assert.Equal(HttpStatusCode.Conflict, removeLeader.StatusCode);

        var remove = await leader.DeleteAsync($"api/Team/{teamId}/member/{memberId}");
        Assert.Equal(HttpStatusCode.NoContent, remove.StatusCode);

        // Um membro comum (sem perfil de líder) não gerencia membros: barrado pela policy.
        var outsider = await ClientAs(TrilhoWebApplicationFactory.MemberEmail);
        var denied = await outsider.PostAsJsonAsync($"api/Team/{teamId}/member", new RequestTeamMemberJson { UserId = memberId });
        Assert.Equal(HttpStatusCode.Forbidden, denied.StatusCode);
    }

    [Fact]
    public async Task OtherTeamsLeader_CannotManageMembers()
    {
        var admin = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);
        var leaderA = await CreateUser(admin, Roles.LEADER);
        var leaderB = await CreateUser(admin, Roles.LEADER);
        var memberId = await CreateUser(admin, Roles.USER);

        await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("TA"), LeaderId = leaderA });
        var teamB = await ReadJson(await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("TB"), LeaderId = leaderB }));

        var emailA = (await ReadJson(await admin.GetAsync($"api/User/{leaderA}"))).GetProperty("email").GetString()!;
        var clientA = await ClientAs(emailA, RequestUserJsonBuilder.ValidPassword);

        var response = await clientA.PostAsJsonAsync($"api/Team/{teamB.GetProperty("id").GetInt64()}/member", new RequestTeamMemberJson { UserId = memberId });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ChangeLeader_MovesLeadershipAndKeepsOldLeaderAsMember()
    {
        var admin = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);
        var oldLeader = await CreateUser(admin, Roles.LEADER);
        var newLeader = await CreateUser(admin, Roles.LEADER);

        var created = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("E"), LeaderId = oldLeader });
        var teamId = (await ReadJson(created)).GetProperty("id").GetInt64();

        var change = await admin.PutAsJsonAsync($"api/Team/{teamId}/leader", new RequestChangeLeaderJson { LeaderId = newLeader });
        Assert.Equal(HttpStatusCode.NoContent, change.StatusCode);

        var team = await ReadJson(await admin.GetAsync($"api/Team/{teamId}"));
        Assert.Equal(newLeader, team.GetProperty("leaderId").GetInt64());
        Assert.Equal(newLeader, team.GetProperty("leader").GetProperty("id").GetInt64());
        Assert.Equal(2, team.GetProperty("memberCount").GetInt32());

        // O líder anterior fica livre para liderar outro time.
        var another = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("F"), LeaderId = oldLeader });
        Assert.Equal(HttpStatusCode.Created, another.StatusCode);
    }

    [Fact]
    public async Task Archive_HidesFromListAndBlocksChanges_ThenRestore()
    {
        var admin = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);
        var leaderId = await CreateUser(admin, Roles.LEADER);
        var name = UniqueName("G");

        var created = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = name, LeaderId = leaderId });
        var teamId = (await ReadJson(created)).GetProperty("id").GetInt64();

        Assert.Equal(HttpStatusCode.NoContent, (await admin.PostAsync($"api/Team/{teamId}/archive", null)).StatusCode);

        var activeList = await ReadJson(await admin.GetAsync("api/Team"));
        Assert.DoesNotContain(activeList.EnumerateArray(), t => t.GetProperty("id").GetInt64() == teamId);

        var allList = await ReadJson(await admin.GetAsync("api/Team?includeArchived=true"));
        Assert.Contains(allList.EnumerateArray(), t => t.GetProperty("id").GetInt64() == teamId);

        var update = await admin.PutAsJsonAsync($"api/Team/{teamId}", new RequestUpdateTeamJson { Name = UniqueName("H") });
        Assert.Equal(HttpStatusCode.Conflict, update.StatusCode);

        Assert.Equal(HttpStatusCode.NoContent, (await admin.PostAsync($"api/Team/{teamId}/restore", null)).StatusCode);
    }

    [Fact]
    public async Task UserLeadingTeam_CannotBeDeleted_NorLoseLeaderRole()
    {
        var admin = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);
        var leaderId = await CreateUser(admin, Roles.LEADER);

        await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("I"), LeaderId = leaderId });

        var delete = await admin.DeleteAsync($"api/User/{leaderId}");
        Assert.Equal(HttpStatusCode.Conflict, delete.StatusCode);

        var demote = RequestUserJsonBuilder.Build(Roles.USER);
        var update = await admin.PutAsJsonAsync($"api/User/{leaderId}", demote);
        Assert.Equal(HttpStatusCode.Conflict, update.StatusCode);
    }

    [Fact]
    public async Task GetAll_AsMember_ReturnsOnlyOwnTeams_AndGetByIdIsForbiddenForOthers()
    {
        var admin = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);
        var leaderId = await CreateUser(admin, Roles.LEADER);
        var created = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("J"), LeaderId = leaderId });
        var teamId = (await ReadJson(created)).GetProperty("id").GetInt64();

        var member = await ClientAs(TrilhoWebApplicationFactory.MemberEmail);

        var list = await member.GetAsync("api/Team");
        var detail = await member.GetAsync($"api/Team/{teamId}");

        Assert.Equal(HttpStatusCode.Forbidden, detail.StatusCode);
        // Membro seed não participa de nenhum time: 204 (ou lista sem o time criado).
        Assert.True(list.StatusCode == HttpStatusCode.NoContent || list.StatusCode == HttpStatusCode.OK);
        if (list.StatusCode == HttpStatusCode.OK)
        {
            var teams = await ReadJson(list);
            Assert.DoesNotContain(teams.EnumerateArray(), t => t.GetProperty("id").GetInt64() == teamId);
        }
    }
}
