using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Users;
using Trilho.Infrastructure.Seed;

namespace WebApi.Test.Seed;
public class DemoSeederTests : IClassFixture<TrilhoWebApplicationFactory>
{
    private const string DemoPassword = "Demo@Senha2026";
    private readonly TrilhoWebApplicationFactory _factory;

    public DemoSeederTests(TrilhoWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static IConfiguration Config(bool enabled, string? password) => new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Settings:SeedDemo:Enabled"] = enabled.ToString(),
            ["Settings:SeedDemo:Password"] = password
        })
        .Build();

    private async Task<HttpClient?> LoginAsDemoLeader()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = "lider@trilho.demo", Password = DemoPassword });

        if (response.StatusCode != HttpStatusCode.OK)
        {
            return null;
        }

        var login = await response.Content.ReadFromJsonAsync<ResponseUserLoginJson>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login!.Token);

        return client;
    }

    private async Task<int> TotalUsers()
    {
        var admin = _factory.CreateClient();
        var login = await admin.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = TrilhoWebApplicationFactory.AdminEmail, Password = TrilhoWebApplicationFactory.Password });
        var token = (await login.Content.ReadFromJsonAsync<ResponseUserLoginJson>())!.Token;
        admin.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await admin.GetAsync("api/User");

        return int.Parse(response.Headers.GetValues("X-Total-Count").Single());
    }

    [Fact]
    public async Task Seed_WithoutPassword_OrDisabled_DoesNothing()
    {
        await _factory.EnsureSeeded();
        var before = await TotalUsers();

        await DemoSeeder.Seed(_factory.Services, Config(enabled: true, password: null));
        await DemoSeeder.Seed(_factory.Services, Config(enabled: false, password: DemoPassword));

        Assert.Equal(before, await TotalUsers());
    }

    [Fact]
    public async Task Seed_CreatesTeamAndTasks_AndIsIdempotent()
    {
        await _factory.EnsureSeeded();

        await DemoSeeder.Seed(_factory.Services, Config(enabled: true, DemoPassword));
        await DemoSeeder.Seed(_factory.Services, Config(enabled: true, DemoPassword));

        var leader = await LoginAsDemoLeader();
        Assert.NotNull(leader);

        var teams = await leader.GetStringAsync("api/Team");
        Assert.Equal(1, teams.Split("\"name\":\"Equipe Demo\"").Length - 1);

        var team = System.Text.Json.JsonDocument.Parse(teams).RootElement.EnumerateArray()
            .First(item => item.GetProperty("name").GetString() == "Equipe Demo");
        var tasks = await leader.GetStringAsync($"api/Task?teamId={team.GetProperty("id").GetInt64()}");

        Assert.Equal(8, System.Text.Json.JsonDocument.Parse(tasks).RootElement.GetArrayLength());
    }
}
