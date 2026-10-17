using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using CommonTestUtilities.Requests;
using Trilho.Communication.Requests.Tasks;
using Trilho.Communication.Requests.Teams;
using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Users;
using Trilho.Domain.Enum;

namespace WebApi.Test.Permissions;
/// <summary>
/// Matriz de permissões por perfil (RF01/RF02): cada linha é "quem faz o quê com recurso de qual time → status esperado".
/// O mundo é fixo: time A (líder A, membro A) e time B (líder B); "Fora" é um membro sem time; "Admin" vê tudo.
/// </summary>
public class RolePermissionMatrixTests : IClassFixture<TrilhoWebApplicationFactory>
{
    private static readonly SemaphoreSlim WorldLock = new(1, 1);
    private static World? _world;
    private static string? _worldFactoryId;

    private readonly TrilhoWebApplicationFactory _factory;

    public RolePermissionMatrixTests(TrilhoWebApplicationFactory factory)
    {
        _factory = factory;
    }

    // ---------------------------------------------------------------- mundo

    private sealed class World
    {
        public required HttpClient Admin { get; init; }
        public required HttpClient LeaderA { get; init; }
        public required HttpClient LeaderB { get; init; }
        public required HttpClient MemberA { get; init; }
        public required HttpClient Outsider { get; init; }
        public required long LeaderAId { get; init; }
        public required long LeaderBId { get; init; }
        public required long MemberAId { get; init; }
        public required long OutsiderId { get; init; }
        public required long TeamA { get; init; }
        public required long TeamB { get; init; }
        public required long TaskA { get; init; }
        public required long TaskB { get; init; }

        public HttpClient For(string actor) => actor switch
        {
            "Admin" => Admin,
            "LiderA" => LeaderA,
            "LiderB" => LeaderB,
            "MembroA" => MemberA,
            "Fora" => Outsider,
            _ => throw new ArgumentOutOfRangeException(nameof(actor), actor, null)
        };
    }

    private async Task<World> GetWorld()
    {
        await WorldLock.WaitAsync();

        try
        {
            var id = _factory.GetHashCode().ToString();

            if (_world is not null && _worldFactoryId == id)
            {
                return _world;
            }

            await _factory.EnsureSeeded();

            var admin = await LoginClient(TrilhoWebApplicationFactory.AdminEmail, TrilhoWebApplicationFactory.Password);
            var outsider = await LoginClient(TrilhoWebApplicationFactory.MemberEmail, TrilhoWebApplicationFactory.Password);

            var (leaderAId, leaderAEmail) = await CreateUser(admin, Roles.LEADER);
            var (leaderBId, leaderBEmail) = await CreateUser(admin, Roles.LEADER);
            var (memberAId, memberAEmail) = await CreateUser(admin, Roles.USER);

            var teamA = await CreateTeam(admin, "Time A", leaderAId);
            var teamB = await CreateTeam(admin, "Time B", leaderBId);

            (await admin.PostAsJsonAsync($"api/Team/{teamA}/member", new RequestTeamMemberJson { UserId = memberAId })).EnsureSuccessStatusCode();

            var outsiderMe = await outsider.GetFromJsonAsync<ResponseUserJson>("api/Auth/me");

            _world = new World
            {
                Admin = admin,
                LeaderA = await LoginClient(leaderAEmail, RequestUserJsonBuilder.ValidPassword),
                LeaderB = await LoginClient(leaderBEmail, RequestUserJsonBuilder.ValidPassword),
                MemberA = await LoginClient(memberAEmail, RequestUserJsonBuilder.ValidPassword),
                Outsider = outsider,
                LeaderAId = leaderAId,
                LeaderBId = leaderBId,
                MemberAId = memberAId,
                OutsiderId = outsiderMe!.Id,
                TeamA = teamA,
                TeamB = teamB,
                TaskA = await CreateTask(admin, teamA),
                TaskB = await CreateTask(admin, teamB)
            };
            _worldFactoryId = id;

            return _world;
        }
        finally
        {
            WorldLock.Release();
        }
    }

    private async Task<HttpClient> LoginClient(string email, string password)
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = email, Password = password });
        response.EnsureSuccessStatusCode();

        var login = await response.Content.ReadFromJsonAsync<ResponseUserLoginJson>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login!.Token);

        return client;
    }

    private static async Task<(long Id, string Email)> CreateUser(HttpClient admin, string role)
    {
        var request = RequestUserJsonBuilder.Build(role);
        var response = await admin.PostAsJsonAsync("api/User", request);
        response.EnsureSuccessStatusCode();

        return ((await response.Content.ReadFromJsonAsync<ResponseUserJson>())!.Id, request.Email);
    }

    private static async Task<long> IdOf(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        return json.RootElement.GetProperty("id").GetInt64();
    }

    private static async Task<long> CreateTeam(HttpClient admin, string name, long leaderId) =>
        await IdOf(await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = name, Description = "d", LeaderId = leaderId }));

    private static async Task<long> CreateTask(HttpClient client, long teamId) =>
        await IdOf(await client.PostAsJsonAsync("api/Task", new RequestTaskJson { Title = "Tarefa", Description = "d", TeamId = teamId, Priority = TaskPriorities.MEDIUM }));

    private static async Task<long> CreateComment(HttpClient client, long taskId) =>
        await IdOf(await client.PostAsJsonAsync($"api/Task/{taskId}/comment", new RequestCommentJson { Body = "oi" }));

    private static async Task<long> CreateSubtask(HttpClient client, long taskId) =>
        await IdOf(await client.PostAsJsonAsync($"api/Task/{taskId}/subtask", new RequestSubtaskJson { Title = "sub" }));

    // ---------------------------------------------------------------- casos

    private sealed record Case(
        string Name,
        string Actor,
        HttpMethod Method,
        Func<World, Task<string>> Path,
        Func<World, object?> Body,
        HttpStatusCode Expected);

    private static Task<string> Static(string path) => Task.FromResult(path);

    private static Case C(string name, string actor, HttpMethod method, Func<World, Task<string>> path, Func<World, object?> body, HttpStatusCode expected) =>
        new(name, actor, method, path, body, expected);

    private static readonly HttpStatusCode Ok = HttpStatusCode.OK;
    private static readonly HttpStatusCode NoContent = HttpStatusCode.NoContent;
    private static readonly HttpStatusCode Created = HttpStatusCode.Created;
    private static readonly HttpStatusCode Forbidden = HttpStatusCode.Forbidden;
    private static readonly HttpStatusCode NotFound = HttpStatusCode.NotFound;

    private static object TaskBody(World w, long teamId) => new RequestTaskJson { Title = "Nova", Description = "d", TeamId = teamId, Priority = TaskPriorities.HIGH };
    private static object UpdateBody() => new RequestUpdateTaskJson { Title = "Editada", Description = "d", Priority = TaskPriorities.LOW };

    private static readonly List<Case> Cases =
    [
        // ---- leitura: cada um só vê os times de que participa
        C("Fora lê o time A", "Fora", HttpMethod.Get, w => Static($"api/Team/{w.TeamA}"), _ => null, Forbidden),
        C("Membro A lê o time A", "MembroA", HttpMethod.Get, w => Static($"api/Team/{w.TeamA}"), _ => null, Ok),
        C("Membro A lê o time B", "MembroA", HttpMethod.Get, w => Static($"api/Team/{w.TeamB}"), _ => null, Forbidden),
        C("Líder B lê o time A", "LiderB", HttpMethod.Get, w => Static($"api/Team/{w.TeamA}"), _ => null, Forbidden),
        C("Admin lê o time B", "Admin", HttpMethod.Get, w => Static($"api/Team/{w.TeamB}"), _ => null, Ok),
        C("Fora vê o quadro do time A", "Fora", HttpMethod.Get, w => Static($"api/Task?teamId={w.TeamA}"), _ => null, Forbidden),
        C("Membro A vê o quadro do time A", "MembroA", HttpMethod.Get, w => Static($"api/Task?teamId={w.TeamA}"), _ => null, Ok),
        C("Líder B vê o quadro do time A", "LiderB", HttpMethod.Get, w => Static($"api/Task?teamId={w.TeamA}"), _ => null, Forbidden),
        C("Fora abre tarefa do time A", "Fora", HttpMethod.Get, w => Static($"api/Task/{w.TaskA}"), _ => null, Forbidden),
        C("Líder B abre tarefa do time A", "LiderB", HttpMethod.Get, w => Static($"api/Task/{w.TaskA}"), _ => null, Forbidden),
        C("Membro A abre tarefa do time A", "MembroA", HttpMethod.Get, w => Static($"api/Task/{w.TaskA}"), _ => null, Ok),
        C("Fora vê histórico da tarefa A", "Fora", HttpMethod.Get, w => Static($"api/Task/{w.TaskA}/activity"), _ => null, Forbidden),

        // ---- tarefas
        C("Fora cria tarefa no time A", "Fora", HttpMethod.Post, _ => Static("api/Task"), w => TaskBody(w, w.TeamA), Forbidden),
        C("Líder B cria tarefa no time A", "LiderB", HttpMethod.Post, _ => Static("api/Task"), w => TaskBody(w, w.TeamA), Forbidden),
        C("Membro A cria tarefa no time A", "MembroA", HttpMethod.Post, _ => Static("api/Task"), w => TaskBody(w, w.TeamA), Created),
        C("Líder A cria tarefa no time A", "LiderA", HttpMethod.Post, _ => Static("api/Task"), w => TaskBody(w, w.TeamA), Created),
        C("Admin cria tarefa no time B", "Admin", HttpMethod.Post, _ => Static("api/Task"), w => TaskBody(w, w.TeamB), Created),
        C("Fora edita tarefa do time A", "Fora", HttpMethod.Put, w => Static($"api/Task/{w.TaskA}"), _ => UpdateBody(), Forbidden),
        C("Líder B edita tarefa do time A", "LiderB", HttpMethod.Put, w => Static($"api/Task/{w.TaskA}"), _ => UpdateBody(), Forbidden),
        C("Membro A edita tarefa do time A", "MembroA", HttpMethod.Put, w => Static($"api/Task/{w.TaskA}"), _ => UpdateBody(), NoContent),
        C("Fora move tarefa do time A", "Fora", HttpMethod.Put, w => Static($"api/Task/{w.TaskA}/move"), _ => new RequestMoveTaskJson { Status = TaskStatuses.TODO, Position = 0 }, Forbidden),
        C("Membro A move tarefa do time A", "MembroA", HttpMethod.Put, w => Static($"api/Task/{w.TaskA}/move"), _ => new RequestMoveTaskJson { Status = TaskStatuses.TODO, Position = 0 }, NoContent),
        C("Membro A exclui tarefa do time A", "MembroA", HttpMethod.Delete, async w => $"api/Task/{await CreateTask(w.Admin, w.TeamA)}", _ => null, Forbidden),
        C("Fora exclui tarefa do time A", "Fora", HttpMethod.Delete, async w => $"api/Task/{await CreateTask(w.Admin, w.TeamA)}", _ => null, Forbidden),
        C("Líder B exclui tarefa do time A", "LiderB", HttpMethod.Delete, async w => $"api/Task/{await CreateTask(w.Admin, w.TeamA)}", _ => null, Forbidden),
        C("Líder A exclui tarefa do time A", "LiderA", HttpMethod.Delete, async w => $"api/Task/{await CreateTask(w.Admin, w.TeamA)}", _ => null, NoContent),
        C("Admin exclui tarefa do time B", "Admin", HttpMethod.Delete, async w => $"api/Task/{await CreateTask(w.Admin, w.TeamB)}", _ => null, NoContent),

        // ---- subtarefas e comentários
        C("Fora cria subtarefa no time A", "Fora", HttpMethod.Post, w => Static($"api/Task/{w.TaskA}/subtask"), _ => new RequestSubtaskJson { Title = "x" }, Forbidden),
        C("Membro A cria subtarefa no time A", "MembroA", HttpMethod.Post, w => Static($"api/Task/{w.TaskA}/subtask"), _ => new RequestSubtaskJson { Title = "x" }, Created),
        C("Fora exclui subtarefa do time A", "Fora", HttpMethod.Delete, async w => $"api/Task/{w.TaskA}/subtask/{await CreateSubtask(w.Admin, w.TaskA)}", _ => null, Forbidden),
        C("Membro A exclui subtarefa do time A", "MembroA", HttpMethod.Delete, async w => $"api/Task/{w.TaskA}/subtask/{await CreateSubtask(w.Admin, w.TaskA)}", _ => null, NoContent),
        C("Fora comenta no time A", "Fora", HttpMethod.Post, w => Static($"api/Task/{w.TaskA}/comment"), _ => new RequestCommentJson { Body = "x" }, Forbidden),
        C("Membro A comenta no time A", "MembroA", HttpMethod.Post, w => Static($"api/Task/{w.TaskA}/comment"), _ => new RequestCommentJson { Body = "x" }, Created),
        C("Membro A exclui comentário do líder A", "MembroA", HttpMethod.Delete, async w => $"api/Task/{w.TaskA}/comment/{await CreateComment(w.LeaderA, w.TaskA)}", _ => null, Forbidden),
        C("Líder B exclui comentário do time A", "LiderB", HttpMethod.Delete, async w => $"api/Task/{w.TaskA}/comment/{await CreateComment(w.MemberA, w.TaskA)}", _ => null, Forbidden),
        C("Membro A exclui o próprio comentário", "MembroA", HttpMethod.Delete, async w => $"api/Task/{w.TaskA}/comment/{await CreateComment(w.MemberA, w.TaskA)}", _ => null, NoContent),
        C("Líder A modera comentário do membro", "LiderA", HttpMethod.Delete, async w => $"api/Task/{w.TaskA}/comment/{await CreateComment(w.MemberA, w.TaskA)}", _ => null, NoContent),
        C("Admin modera comentário do membro", "Admin", HttpMethod.Delete, async w => $"api/Task/{w.TaskA}/comment/{await CreateComment(w.MemberA, w.TaskA)}", _ => null, NoContent),

        // ---- times
        C("Membro cria time", "MembroA", HttpMethod.Post, _ => Static("api/Team"), w => new RequestTeamJson { Name = "Novo M", Description = "d", LeaderId = w.LeaderAId }, Forbidden),
        C("Líder cria time", "LiderA", HttpMethod.Post, _ => Static("api/Team"), w => new RequestTeamJson { Name = "Novo L", Description = "d", LeaderId = w.LeaderAId }, Forbidden),
        C("Membro edita time A", "MembroA", HttpMethod.Put, w => Static($"api/Team/{w.TeamA}"), _ => new RequestUpdateTeamJson { Name = "Time A", Description = "m" }, Forbidden),
        C("Líder B edita time A", "LiderB", HttpMethod.Put, w => Static($"api/Team/{w.TeamA}"), _ => new RequestUpdateTeamJson { Name = "Time A", Description = "b" }, Forbidden),
        C("Líder A edita time A", "LiderA", HttpMethod.Put, w => Static($"api/Team/{w.TeamA}"), _ => new RequestUpdateTeamJson { Name = "Time A", Description = "a" }, NoContent),
        C("Admin edita time B", "Admin", HttpMethod.Put, w => Static($"api/Team/{w.TeamB}"), _ => new RequestUpdateTeamJson { Name = "Time B", Description = "adm" }, NoContent),
        C("Líder A troca o líder do time A", "LiderA", HttpMethod.Put, w => Static($"api/Team/{w.TeamA}/leader"), w => new RequestChangeLeaderJson { LeaderId = w.LeaderBId }, Forbidden),
        C("Membro adiciona membro ao time A", "MembroA", HttpMethod.Post, w => Static($"api/Team/{w.TeamA}/member"), w => new RequestTeamMemberJson { UserId = w.OutsiderId }, Forbidden),
        C("Líder B adiciona membro ao time A", "LiderB", HttpMethod.Post, w => Static($"api/Team/{w.TeamA}/member"), w => new RequestTeamMemberJson { UserId = w.OutsiderId }, Forbidden),
        C("Líder B remove membro do time A", "LiderB", HttpMethod.Delete, w => Static($"api/Team/{w.TeamA}/member/{w.MemberAId}"), _ => null, Forbidden),
        C("Membro remove membro do time A", "MembroA", HttpMethod.Delete, w => Static($"api/Team/{w.TeamA}/member/{w.MemberAId}"), _ => null, Forbidden),
        C("Líder arquiva time", "LiderA", HttpMethod.Post, w => Static($"api/Team/{w.TeamA}/archive"), _ => null, Forbidden),
        C("Líder restaura time", "LiderA", HttpMethod.Post, w => Static($"api/Team/{w.TeamA}/restore"), _ => null, Forbidden),
        C("Líder exclui time", "LiderA", HttpMethod.Delete, w => Static($"api/Team/{w.TeamA}"), _ => null, Forbidden),
        C("Membro exclui time", "MembroA", HttpMethod.Delete, w => Static($"api/Team/{w.TeamA}"), _ => null, Forbidden),

        // ---- usuários
        C("Membro lista usuários", "MembroA", HttpMethod.Get, _ => Static("api/User"), _ => null, Forbidden),
        C("Líder lista usuários", "LiderA", HttpMethod.Get, _ => Static("api/User"), _ => null, Ok),
        C("Líder cria usuário", "LiderA", HttpMethod.Post, _ => Static("api/User"), _ => RequestUserJsonBuilder.Build(), Forbidden),
        C("Membro edita outro usuário", "MembroA", HttpMethod.Put, w => Static($"api/User/{w.LeaderAId}"), _ => RequestUserJsonBuilder.Build(), Forbidden),
        C("Líder edita outro usuário", "LiderA", HttpMethod.Put, w => Static($"api/User/{w.MemberAId}"), _ => RequestUserJsonBuilder.Build(), Forbidden),
        C("Líder exclui usuário", "LiderA", HttpMethod.Delete, w => Static($"api/User/{w.MemberAId}"), _ => null, Forbidden),
        C("Membro exclui usuário", "MembroA", HttpMethod.Delete, w => Static($"api/User/{w.LeaderAId}"), _ => null, Forbidden),
        C("Líder desativa usuário", "LiderA", HttpMethod.Put, w => Static($"api/User/{w.MemberAId}/status"), _ => new RequestUserStatusJson { IsActive = false }, Forbidden),
        C("Admin não exclui líder de time", "Admin", HttpMethod.Delete, w => Static($"api/User/{w.LeaderAId}"), _ => null, HttpStatusCode.Conflict),
        C("Admin não desativa líder de time", "Admin", HttpMethod.Put, w => Static($"api/User/{w.LeaderAId}/status"), _ => new RequestUserStatusJson { IsActive = false }, HttpStatusCode.Conflict),

        // ---- convites
        C("Membro convida", "MembroA", HttpMethod.Post, _ => Static("api/Invite"), w => Invite(w.TeamA, Roles.USER), Forbidden),
        C("Líder A convida membro ao time A", "LiderA", HttpMethod.Post, _ => Static("api/Invite"), w => Invite(w.TeamA, Roles.USER), Created),
        C("Líder A convida membro ao time B", "LiderA", HttpMethod.Post, _ => Static("api/Invite"), w => Invite(w.TeamB, Roles.USER), Forbidden),
        C("Líder A convida líder ao time A", "LiderA", HttpMethod.Post, _ => Static("api/Invite"), w => Invite(w.TeamA, Roles.LEADER), Forbidden),
        C("Líder A convida administrador", "LiderA", HttpMethod.Post, _ => Static("api/Invite"), w => Invite(w.TeamA, Roles.ADMIN), Forbidden),
        C("Admin convida líder ao time B", "Admin", HttpMethod.Post, _ => Static("api/Invite"), w => Invite(w.TeamB, Roles.LEADER), Created),
        C("Membro lista convites", "MembroA", HttpMethod.Get, _ => Static("api/Invite"), _ => null, Forbidden),
        C("Líder lista convites", "LiderA", HttpMethod.Get, _ => Static("api/Invite"), _ => null, HttpStatusCode.OK),

        // ---- Git e priorização
        C("Membro conecta repositório", "MembroA", HttpMethod.Post, _ => Static("api/GitRepository"), w => Repo(w.TeamA), Forbidden),
        C("Líder B conecta repositório no time A", "LiderB", HttpMethod.Post, _ => Static("api/GitRepository"), w => Repo(w.TeamA), Forbidden),
        C("Fora vê ranking do time A", "Fora", HttpMethod.Get, w => Static($"api/Prioritization/ranking?teamId={w.TeamA}"), _ => null, Forbidden),
        C("Membro A vê ranking do time A", "MembroA", HttpMethod.Get, w => Static($"api/Prioritization/ranking?teamId={w.TeamA}"), _ => null, Ok),
        C("Membro aplica priorização", "MembroA", HttpMethod.Post, _ => Static("api/Prioritization/apply"), w => new { TeamId = w.TeamA }, Forbidden),
        C("Líder B aplica priorização no time A", "LiderB", HttpMethod.Post, _ => Static("api/Prioritization/apply"), w => new { TeamId = w.TeamA }, Forbidden),
        C("Líder A aplica priorização no time A", "LiderA", HttpMethod.Post, _ => Static("api/Prioritization/apply"), w => new { TeamId = w.TeamA }, Ok),
    ];

    private static object Invite(long teamId, string role) => new
    {
        Email = $"conv.{Guid.NewGuid():N}@trilho.test",
        FullName = "Convidado",
        TeamId = teamId,
        Role = role
    };

    private static object Repo(long teamId) => new { Provider = "github", FullName = "org/repo-" + Guid.NewGuid().ToString("N")[..6], TeamId = teamId };

    public static IEnumerable<object[]> CaseData() => Cases.Select((c, index) => new object[] { index, c.Name });

    [Theory]
    [MemberData(nameof(CaseData))]
    public async Task Matrix(int index, string name)
    {
        var c = Cases[index];
        var world = await GetWorld();

        using var request = new HttpRequestMessage(c.Method, await c.Path(world));
        if (c.Body(world) is { } body)
        {
            request.Content = JsonContent.Create(body);
        }

        var response = await world.For(c.Actor).SendAsync(request);

        Assert.True(c.Expected == response.StatusCode,
            $"[{name}] {c.Actor} {c.Method} {request.RequestUri} → esperado {(int)c.Expected}, veio {(int)response.StatusCode}: {await response.Content.ReadAsStringAsync()}");
    }

    // ---------------------------------------------------------------- listas: cada perfil só enxerga o que é seu

    private static async Task<List<string>> TeamNames(HttpClient client)
    {
        var response = await client.GetAsync("api/Team");
        if (response.StatusCode == HttpStatusCode.NoContent)
        {
            return [];
        }

        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        return json.RootElement.EnumerateArray().Select(team => team.GetProperty("name").GetString()!).ToList();
    }

    [Fact]
    public async Task TeamList_ShowsOnlyTeamsTheUserBelongsTo_AdminSeesAll()
    {
        var world = await GetWorld();

        Assert.Equal(["Time A"], await TeamNames(world.MemberA));
        Assert.Equal(["Time A"], await TeamNames(world.LeaderA));
        Assert.Equal(["Time B"], await TeamNames(world.LeaderB));
        Assert.Empty(await TeamNames(world.Outsider));
        Assert.Contains("Time A", await TeamNames(world.Admin));
        Assert.Contains("Time B", await TeamNames(world.Admin));
    }

    [Fact]
    public async Task TaskList_WithoutTeamFilter_ShowsOnlyTheUsersTeams()
    {
        var world = await GetWorld();

        var response = await world.MemberA.GetAsync("api/Task");
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var teamIds = json.RootElement.EnumerateArray().Select(task => task.GetProperty("teamId").GetInt64()).Distinct().ToList();

        Assert.Equal([world.TeamA], teamIds);
    }

    [Fact]
    public async Task OwnProfile_AnyRoleCanEditNameAndPassword_ButNotRole()
    {
        var world = await GetWorld();
        var me = await world.MemberA.GetFromJsonAsync<ResponseUserJson>("api/Auth/me");

        var rename = new RequestUserJson { Name = "Novo Nome", Email = me!.Email, Password = "", Role = Roles.USER };
        var promote = new RequestUserJson { Name = "Novo Nome", Email = me.Email, Password = "", Role = Roles.ADMIN };

        Assert.Equal(HttpStatusCode.NoContent, (await world.MemberA.PutAsJsonAsync($"api/User/{me.Id}", rename)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await world.MemberA.PutAsJsonAsync($"api/User/{me.Id}", promote)).StatusCode);
    }
}
