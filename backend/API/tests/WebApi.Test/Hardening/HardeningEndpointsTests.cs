using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Trilho.Application.UseCases.Maintenance.PurgeOldData;
using Trilho.Communication.Requests.Tasks;
using Trilho.Communication.Requests.Teams;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Infrastructure.DataAcess;
using static WebApi.Test.TestApi;

namespace WebApi.Test.Hardening;
public class HardeningEndpointsTests : IClassFixture<TrilhoWebApplicationFactory>
{
    private readonly TrilhoWebApplicationFactory _factory;

    public HardeningEndpointsTests(TrilhoWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Responses_CarryCorrelationIdAndSecurityHeaders()
    {
        await _factory.EnsureSeeded();

        var response = await _factory.CreateClient().GetAsync("health");

        Assert.True(response.Headers.TryGetValues("X-Correlation-Id", out var ids));
        Assert.Equal(32, ids!.Single().Length);
        Assert.Equal("nosniff", response.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("DENY", response.Headers.GetValues("X-Frame-Options").Single());
        Assert.Contains("no-store", response.Headers.CacheControl?.ToString());
    }

    [Fact]
    public async Task CorrelationId_FromClient_IsEchoed_ButGarbageIsReplaced()
    {
        await _factory.EnsureSeeded();
        var client = _factory.CreateClient();

        var good = new HttpRequestMessage(HttpMethod.Get, "health");
        good.Headers.Add("X-Correlation-Id", "req-12345678");
        var goodResponse = await client.SendAsync(good);

        var bad = new HttpRequestMessage(HttpMethod.Get, "health");
        bad.Headers.Add("X-Correlation-Id", "x y<script>");
        var badResponse = await client.SendAsync(bad);

        Assert.Equal("req-12345678", goodResponse.Headers.GetValues("X-Correlation-Id").Single());
        Assert.NotEqual("x y<script>", badResponse.Headers.GetValues("X-Correlation-Id").Single());
    }

    [Fact]
    public async Task Token_WithWrongIssuer_IsRejected()
    {
        await _factory.EnsureSeeded();
        var client = _factory.CreateClient();

        // JWT assinado com a chave correta, mas sem emissor/audiência esperados.
        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var key = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes("integration-tests-signing-key-0123456789abcdef"));
        var token = handler.WriteToken(new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
            issuer: "outro-emissor",
            audience: "outra-audiencia",
            claims: [new System.Security.Claims.Claim("id", "1"), new System.Security.Claims.Claim("role", "administrador")],
            expires: DateTime.UtcNow.AddMinutes(10),
            signingCredentials: new Microsoft.IdentityModel.Tokens.SigningCredentials(key, Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256)));

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("api/Auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Users_ArePaginated_WithTotalInBodyAndHeaders()
    {
        var admin = await Admin(_factory);

        for (var i = 0; i < 3; i++)
        {
            await CreateUserWithClient(_factory, admin, Roles.USER);
        }

        var response = await admin.GetAsync("api/User?page=1&pageSize=2");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var users = await ReadJson(response);
        Assert.Equal(2, users.GetArrayLength());
        Assert.True(int.Parse(response.Headers.GetValues("X-Total-Count").Single()) >= 5);
        Assert.Equal("1", response.Headers.GetValues("X-Page").Single());
        Assert.Equal("2", response.Headers.GetValues("X-Page-Size").Single());

        var second = await ReadJson(await admin.GetAsync("api/User?page=2&pageSize=2"));
        Assert.NotEqual(users[0].GetProperty("id").GetInt64(), second[0].GetProperty("id").GetInt64());
    }

    [Fact]
    public async Task Users_PageSizeIsCapped()
    {
        var admin = await Admin(_factory);

        var response = await admin.GetAsync("api/User?pageSize=100000");

        Assert.Equal("200", response.Headers.GetValues("X-Page-Size").Single());
    }

    [Fact]
    public async Task Board_PaginationReturnsTotalAndRespectsPageSize()
    {
        var admin = await Admin(_factory);
        var leader = await CreateUserWithClient(_factory, admin, Roles.LEADER);
        var team = await ReadJson(await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("T"), LeaderId = leader.Id }));
        var teamId = team.GetProperty("id").GetInt64();

        for (var i = 0; i < 3; i++)
        {
            (await leader.Client.PostAsJsonAsync("api/Task", new RequestTaskJson { Title = $"T{i}", TeamId = teamId, Priority = TaskPriorities.LOW })).EnsureSuccessStatusCode();
        }

        var response = await leader.Client.GetAsync($"api/Task?teamId={teamId}&page=1&pageSize=2");

        Assert.Equal(2, (await ReadJson(response)).GetArrayLength());
        Assert.Equal("3", response.Headers.GetValues("X-Total-Count").Single());
    }

    [Fact]
    public async Task Retention_RemovesOldProcessedEventsAndClosedTokens_KeepsRecentOnes()
    {
        await _factory.EnsureSeeded();
        var old = DateTime.UtcNow.AddDays(-60);
        var recent = DateTime.UtcNow.AddDays(-1);

        long oldEventId, recentEventId, pendingEventId;

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<TrilhoDbContext>();
            var admin = context.Users.First(user => user.Role == Roles.ADMIN);

            var team = new Team { Name = UniqueName("Ret"), LeaderId = admin.Id };
            context.Teams.Add(team);
            await context.SaveChangesAsync();

            var repository = new GitRepository { Provider = "github", FullName = $"o/{UniqueName("r")}", TeamId = team.Id, WebhookSecretProtected = "x" };
            context.GitRepositories.Add(repository);
            await context.SaveChangesAsync();

            var oldEvent = new PendingGitEvent { RepositoryId = repository.Id, EventType = "push", Payload = "{}", ProcessedAt = old };
            var recentEvent = new PendingGitEvent { RepositoryId = repository.Id, EventType = "push", Payload = "{}", ProcessedAt = recent };
            var pendingEvent = new PendingGitEvent { RepositoryId = repository.Id, EventType = "push", Payload = "{}", ProcessedAt = null, ReceivedAt = old };
            context.PendingGitEvents.AddRange(oldEvent, recentEvent, pendingEvent);

            context.PasswordResetRequests.Add(new PasswordResetRequest { UserId = admin.Id, CodeHash = "h", ExpiresAt = old, CreatedAt = old, UsedAt = old });

            await context.SaveChangesAsync();

            (oldEventId, recentEventId, pendingEventId) = (oldEvent.Id, recentEvent.Id, pendingEvent.Id);
        }

        using (var scope = _factory.Services.CreateScope())
        {
            var result = await scope.ServiceProvider.GetRequiredService<IPurgeOldDataUseCase>().Execute();

            Assert.True(result.GitEvents >= 1);
            Assert.True(result.PasswordResets >= 1);
        }

        using (var scope = _factory.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<TrilhoDbContext>();

            Assert.Null(await context.PendingGitEvents.FindAsync(oldEventId));
            Assert.NotNull(await context.PendingGitEvents.FindAsync(recentEventId));
            // Evento ainda não processado nunca é descartado pela retenção.
            Assert.NotNull(await context.PendingGitEvents.FindAsync(pendingEventId));
        }
    }
}
