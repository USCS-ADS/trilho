using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Trilho.Application.UseCases.Notifications.GenerateDueSoon;
using Trilho.Communication.Requests.Tasks;
using Trilho.Communication.Requests.Teams;
using Trilho.Domain.Enum;
using static WebApi.Test.TestApi;

namespace WebApi.Test.Dashboard;
public class DashboardAndNotificationEndpointsTests : IClassFixture<TrilhoWebApplicationFactory>
{
    private readonly TrilhoWebApplicationFactory _factory;

    public DashboardAndNotificationEndpointsTests(TrilhoWebApplicationFactory factory)
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

    private static async Task<long> CreateTask(HttpClient client, long teamId, string title, long? assigneeId = null, DateOnly? due = null)
    {
        var response = await client.PostAsJsonAsync("api/Task", new RequestTaskJson
        {
            Title = title,
            TeamId = teamId,
            Priority = TaskPriorities.MEDIUM,
            AssigneeId = assigneeId,
            DueDate = due
        });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        return (await ReadJson(response)).GetProperty("id").GetInt64();
    }

    // ---- Dashboard

    [Fact]
    public async Task Dashboard_Member_IsForbidden()
    {
        await _factory.EnsureSeeded();
        var member = await LoginAs(_factory, TrilhoWebApplicationFactory.MemberEmail);

        var response = await member.GetAsync("api/Dashboard");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Dashboard_Leader_SeesOnlyTheirTeam_WithWorkloadAndOverdue()
    {
        var s = await Scenario();
        var yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        await CreateTask(s.Leader.Client, s.TeamId, "Atrasada", s.Member.Id, yesterday);
        await CreateTask(s.Leader.Client, s.TeamId, "Em dia", s.Member.Id);
        var doneId = await CreateTask(s.Leader.Client, s.TeamId, "Pronta");
        (await s.Leader.Client.PutAsJsonAsync($"api/Task/{doneId}/move", new RequestMoveTaskJson { Status = TaskStatuses.DONE, Position = 0 })).EnsureSuccessStatusCode();

        var response = await s.Leader.Client.GetAsync("api/Dashboard");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dashboard = await ReadJson(response);

        Assert.Equal(1, dashboard.GetProperty("activeTeams").GetInt32());
        Assert.Equal(2, dashboard.GetProperty("activeTasks").GetInt32());
        Assert.Equal(1, dashboard.GetProperty("overdueTasks").GetInt32());
        Assert.Equal(1, dashboard.GetProperty("completedInCurrentSprint").GetInt32());

        var workload = dashboard.GetProperty("teamWorkloads")[0];
        Assert.Equal(s.TeamId, workload.GetProperty("teamId").GetInt64());
        Assert.Equal(2, workload.GetProperty("memberCount").GetInt32());
        Assert.Equal(2, workload.GetProperty("openTasks").GetInt32());
        // 2 tarefas em aberto ÷ (2 membros × 8) = 12,5% → 13
        Assert.Equal(13, workload.GetProperty("workloadPercent").GetInt32());
        Assert.False(workload.GetProperty("isOverloaded").GetBoolean());

        Assert.Equal(5, dashboard.GetProperty("sprints").GetArrayLength());
        Assert.Equal(5, dashboard.GetProperty("tasksByStatus").GetArrayLength());
    }

    // ---- Notificações

    [Fact]
    public async Task Notifications_AssignmentAndStatusChange_NotifyTheAssignee_AndCanBeMarkedRead()
    {
        var s = await Scenario();

        var taskId = await CreateTask(s.Leader.Client, s.TeamId, "Criar relatório", s.Member.Id);
        (await s.Leader.Client.PutAsJsonAsync($"api/Task/{taskId}/move", new RequestMoveTaskJson { Status = TaskStatuses.IN_PROGRESS, Position = 0 })).EnsureSuccessStatusCode();

        var list = await ReadJson(await s.Member.Client.GetAsync("api/Notification"));
        Assert.Equal(2, list.GetProperty("unreadCount").GetInt32());

        var types = list.GetProperty("notifications").EnumerateArray().Select(n => n.GetProperty("type").GetString()).ToList();
        Assert.Contains("task-assigned", types);
        Assert.Contains("task-status-changed", types);
        Assert.All(list.GetProperty("notifications").EnumerateArray(), n => Assert.Equal(taskId, n.GetProperty("taskId").GetInt64()));

        // O autor da ação não é notificado das próprias alterações.
        var leaderList = await ReadJson(await s.Leader.Client.GetAsync("api/Notification"));
        Assert.Equal(0, leaderList.GetProperty("unreadCount").GetInt32());

        var firstId = list.GetProperty("notifications")[0].GetProperty("id").GetInt64();

        var foreign = await s.Leader.Client.PutAsync($"api/Notification/{firstId}/read", null);
        Assert.Equal(HttpStatusCode.NotFound, foreign.StatusCode);

        var read = await s.Member.Client.PutAsync($"api/Notification/{firstId}/read", null);
        Assert.Equal(HttpStatusCode.NoContent, read.StatusCode);
        Assert.Equal(1, (await ReadJson(await s.Member.Client.GetAsync("api/Notification"))).GetProperty("unreadCount").GetInt32());

        var all = await s.Member.Client.PutAsync("api/Notification/read-all", null);
        Assert.Equal(HttpStatusCode.NoContent, all.StatusCode);
        Assert.Equal(0, (await ReadJson(await s.Member.Client.GetAsync("api/Notification?unreadOnly=true"))).GetProperty("notifications").GetArrayLength());
    }

    [Fact]
    public async Task Notifications_DueSoonJob_CreatesOneWarningPerTask()
    {
        var s = await Scenario();
        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var taskId = await CreateTask(s.Leader.Client, s.TeamId, "Entrega amanhã", s.Member.Id, tomorrow);

        using (var scope = _factory.Services.CreateScope())
        {
            var useCase = scope.ServiceProvider.GetRequiredService<IGenerateDueSoonNotificationsUseCase>();
            await useCase.Execute();
        }

        using (var scope = _factory.Services.CreateScope())
        {
            var useCase = scope.ServiceProvider.GetRequiredService<IGenerateDueSoonNotificationsUseCase>();
            await useCase.Execute();
        }

        var list = await ReadJson(await s.Member.Client.GetAsync("api/Notification"));
        var dueSoon = list.GetProperty("notifications").EnumerateArray()
            .Where(n => n.GetProperty("type").GetString() == "task-due-soon" && n.GetProperty("taskId").GetInt64() == taskId)
            .ToList();

        Assert.Single(dueSoon);
    }
}
