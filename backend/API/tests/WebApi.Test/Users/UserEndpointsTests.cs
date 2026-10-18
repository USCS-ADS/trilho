using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using CommonTestUtilities.Requests;
using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Users;
using Trilho.Domain.Enum;

namespace WebApi.Test.Users;
public class UserEndpointsTests : IClassFixture<TrilhoWebApplicationFactory>
{
    private readonly TrilhoWebApplicationFactory _factory;

    public UserEndpointsTests(TrilhoWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<HttpClient> ClientAs(string? email)
    {
        await _factory.EnsureSeeded();

        var client = _factory.CreateClient();

        if (email is not null)
        {
            var response = await client.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = email, Password = TrilhoWebApplicationFactory.Password });
            response.EnsureSuccessStatusCode();

            var login = await response.Content.ReadFromJsonAsync<ResponseUserLoginJson>();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login!.Token);
        }

        return client;
    }

    [Fact]
    public async Task Login_ReturnsOk()
    {
        var client = await ClientAs(null);

        var response = await client.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = TrilhoWebApplicationFactory.AdminEmail, Password = TrilhoWebApplicationFactory.Password });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsUnauthorized()
    {
        var client = await ClientAs(null);

        var response = await client.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = TrilhoWebApplicationFactory.AdminEmail, Password = "wrong" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_WithoutToken_ReturnsUnauthorized()
    {
        var client = await ClientAs(null);

        var response = await client.GetAsync("api/User");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_AsMember_ReturnsForbidden()
    {
        var client = await ClientAs(TrilhoWebApplicationFactory.MemberEmail);

        var response = await client.GetAsync("api/User");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_AsAdmin_ReturnsOk()
    {
        var client = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);

        var response = await client.GetAsync("api/User");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Me_ReturnsLoggedUser_ResolvedFromIdClaim()
    {
        var client = await ClientAs(TrilhoWebApplicationFactory.MemberEmail);

        var response = await client.GetAsync("api/Auth/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal(TrilhoWebApplicationFactory.MemberEmail, body.RootElement.GetProperty("email").GetString());
    }

    [Fact]
    public async Task Create_AsMember_ReturnsForbidden()
    {
        var client = await ClientAs(TrilhoWebApplicationFactory.MemberEmail);

        var response = await client.PostAsJsonAsync("api/User", RequestUserJsonBuilder.Build());

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Create_AsAdmin_ReturnsCreated_AndDuplicateEmailIsRejected()
    {
        var client = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);
        var request = RequestUserJsonBuilder.Build(Roles.LEADER);

        var first = await client.PostAsJsonAsync("api/User", request);
        var second = await client.PostAsJsonAsync("api/User", request);

        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
    }

    private async Task<(HttpClient admin, RequestUserJson user, long id)> CreateUser()
    {
        var admin = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);
        var request = RequestUserJsonBuilder.Build();

        var created = await admin.PostAsJsonAsync("api/User", request);
        created.EnsureSuccessStatusCode();

        var body = await created.Content.ReadFromJsonAsync<ResponseUserJson>();

        return (admin, request, body!.Id);
    }

    private async Task<HttpClient> Login(string email, string password)
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = email, Password = password });
        response.EnsureSuccessStatusCode();

        var login = await response.Content.ReadFromJsonAsync<ResponseUserLoginJson>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login!.Token);

        return client;
    }

    [Fact]
    public async Task ChangePassword_WithCurrentPassword_AllowsLoginWithNewOne()
    {
        var (_, user, _) = await CreateUser();
        var client = await Login(user.Email, user.Password);

        var response = await client.PutAsJsonAsync("api/User/change-password", new RequestChangePasswordJson { CurrentPassword = user.Password, NewPassword = "Novo@12345" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var oldLogin = await _factory.CreateClient().PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = user.Email, Password = user.Password });
        Assert.Equal(HttpStatusCode.Unauthorized, oldLogin.StatusCode);

        await Login(user.Email, "Novo@12345");
    }

    [Fact]
    public async Task ChangePassword_DropsOtherSessions_ButTheReturnedTokenKeepsTheCurrentOneAlive()
    {
        var (_, user, _) = await CreateUser();
        var current = await Login(user.Email, user.Password);
        var other = await Login(user.Email, user.Password);

        var response = await current.PutAsJsonAsync("api/User/change-password", new RequestChangePasswordJson { CurrentPassword = user.Password, NewPassword = "Novo@12345" });
        var fresh = await response.Content.ReadFromJsonAsync<ResponseUserLoginJson>();

        Assert.Equal(HttpStatusCode.Unauthorized, (await other.GetAsync("api/Auth/me")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await current.GetAsync("api/Auth/me")).StatusCode);

        current.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", fresh!.Token);
        Assert.Equal(HttpStatusCode.OK, (await current.GetAsync("api/Auth/me")).StatusCode);
    }

    [Fact]
    public async Task PasswordReset_DropsExistingSessions()
    {
        var (_, user, _) = await CreateUser();
        var session = await Login(user.Email, user.Password);
        var anonymous = _factory.CreateClient();

        await anonymous.PostAsJsonAsync("api/PasswordReset/request", new Trilho.Communication.Requests.PasswordReset.RequestPasswordResetJson { Email = user.Email });
        var code = _factory.Emails.ResetCodeFor(user.Email);
        var confirm = await anonymous.PostAsJsonAsync("api/PasswordReset/confirm", new Trilho.Communication.Requests.PasswordReset.RequestConfirmPasswordResetJson { Email = user.Email, Code = code, NewPassword = "Redefinida@2026" });

        Assert.Equal(HttpStatusCode.NoContent, confirm.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await session.GetAsync("api/Auth/me")).StatusCode);
    }

    [Fact]
    public async Task AdminSettingAnotherUsersPassword_DropsThatUsersSessions()
    {
        var (admin, user, id) = await CreateUser();
        var session = await Login(user.Email, user.Password);

        var update = await admin.PutAsJsonAsync($"api/User/{id}", new RequestUserJson { Name = "Test User", Email = user.Email, Password = "Admin@Definiu1", Role = Roles.USER });

        Assert.Equal(HttpStatusCode.NoContent, update.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await session.GetAsync("api/Auth/me")).StatusCode);
    }

    [Fact]
    public async Task ChangePassword_WithWrongCurrentPassword_ReturnsBadRequest()
    {
        var (_, user, _) = await CreateUser();
        var client = await Login(user.Email, user.Password);

        var response = await client.PutAsJsonAsync("api/User/change-password", new RequestChangePasswordJson { CurrentPassword = "Errada@1234", NewPassword = "Novo@12345" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SetStatus_Deactivate_BlocksLoginAndExistingToken_ThenReactivates()
    {
        var (admin, user, id) = await CreateUser();
        var client = await Login(user.Email, user.Password);

        var deactivate = await admin.PutAsJsonAsync($"api/User/{id}/status", new RequestUserStatusJson { IsActive = false });
        Assert.Equal(HttpStatusCode.NoContent, deactivate.StatusCode);

        var login = await _factory.CreateClient().PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = user.Email, Password = user.Password });
        Assert.Equal(HttpStatusCode.Unauthorized, login.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("api/Auth/me")).StatusCode);

        var reactivate = await admin.PutAsJsonAsync($"api/User/{id}/status", new RequestUserStatusJson { IsActive = true });
        Assert.Equal(HttpStatusCode.NoContent, reactivate.StatusCode);

        await Login(user.Email, user.Password);
    }

    [Fact]
    public async Task SetStatus_AsMember_ReturnsForbidden()
    {
        var client = await ClientAs(TrilhoWebApplicationFactory.MemberEmail);

        var response = await client.PutAsJsonAsync("api/User/1/status", new RequestUserStatusJson { IsActive = false });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task SetStatus_DeactivatingYourself_ReturnsConflict()
    {
        var admin = await ClientAs(TrilhoWebApplicationFactory.AdminEmail);
        var me = await (await admin.GetAsync("api/Auth/me")).Content.ReadFromJsonAsync<ResponseUserJson>();

        var response = await admin.PutAsJsonAsync($"api/User/{me!.Id}/status", new RequestUserStatusJson { IsActive = false });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Login_AfterTooManyWrongPasswords_LocksTheAccount_EvenForTheRightPassword()
    {
        var (_, user, _) = await CreateUser();
        var anonymous = _factory.CreateClient();

        for (var attempt = 0; attempt < 5; attempt++)
        {
            var wrong = await anonymous.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = user.Email, Password = "Errada@1234" });
            Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
        }

        var locked = await anonymous.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = user.Email, Password = user.Password });

        Assert.Equal(HttpStatusCode.TooManyRequests, locked.StatusCode);
    }

    [Fact]
    public async Task Login_Lockout_DoesNotAffectOtherAccounts_AndASuccessResetsTheCounter()
    {
        var (_, user, _) = await CreateUser();
        var anonymous = _factory.CreateClient();

        for (var attempt = 0; attempt < 4; attempt++)
        {
            await anonymous.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = user.Email, Password = "Errada@1234" });
        }

        // O acerto zera o contador: mais 4 erros ainda não bloqueiam.
        await Login(user.Email, user.Password);

        for (var attempt = 0; attempt < 4; attempt++)
        {
            var wrong = await anonymous.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = user.Email, Password = "Errada@1234" });
            Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
        }

        await Login(TrilhoWebApplicationFactory.AdminEmail, TrilhoWebApplicationFactory.Password);
    }

    [Fact]
    public async Task Login_Lockout_IsClearedByAPasswordReset()
    {
        var (_, user, _) = await CreateUser();
        var anonymous = _factory.CreateClient();

        for (var attempt = 0; attempt < 5; attempt++)
        {
            await anonymous.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = user.Email, Password = "Errada@1234" });
        }

        await anonymous.PostAsJsonAsync("api/PasswordReset/request", new Trilho.Communication.Requests.PasswordReset.RequestPasswordResetJson { Email = user.Email });
        var code = _factory.Emails.ResetCodeFor(user.Email);

        var confirm = await anonymous.PostAsJsonAsync("api/PasswordReset/confirm", new Trilho.Communication.Requests.PasswordReset.RequestConfirmPasswordResetJson { Email = user.Email, Code = code, NewPassword = "Redefinida@2026" });
        Assert.Equal(HttpStatusCode.NoContent, confirm.StatusCode);

        await Login(user.Email, "Redefinida@2026");
    }

    [Fact]
    public async Task Health_IsAnonymous()
    {
        var client = await ClientAs(null);

        var response = await client.GetAsync("health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
