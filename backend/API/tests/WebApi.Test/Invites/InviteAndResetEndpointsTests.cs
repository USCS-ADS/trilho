using System.Net;
using System.Net.Http.Json;
using CommonTestUtilities.Requests;
using Trilho.Communication.Requests.Invites;
using Trilho.Communication.Requests.PasswordReset;
using Trilho.Communication.Requests.Teams;
using Trilho.Communication.Requests.Users;
using Trilho.Domain.Enum;
using static WebApi.Test.TestApi;

namespace WebApi.Test.Invites;
public class InviteAndResetEndpointsTests : IClassFixture<TrilhoWebApplicationFactory>
{
    private const string StrongPassword = "Nova@Senha1";

    private readonly TrilhoWebApplicationFactory _factory;

    public InviteAndResetEndpointsTests(TrilhoWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static string NewEmail() => $"invitee.{Guid.NewGuid().ToString("N")[..8]}@trilho.test";

    private async Task<(long TeamId, HttpClient Admin, HttpClient Leader)> TeamWithLeader()
    {
        var admin = await Admin(_factory);
        var leader = await CreateUserWithClient(_factory, admin, Roles.LEADER);

        var created = await admin.PostAsJsonAsync("api/Team", new RequestTeamJson { Name = UniqueName("Time"), LeaderId = leader.Id });
        var teamId = (await ReadJson(created)).GetProperty("id").GetInt64();

        return (teamId, admin, leader.Client);
    }

    // ---- Convite

    [Fact]
    public async Task Invite_FullFlow_CreatesUserInTeam_AndTokenIsSingleUse()
    {
        var (teamId, admin, leader) = await TeamWithLeader();
        var email = NewEmail();

        var create = await leader.PostAsJsonAsync("api/Invite", new RequestInviteJson { Email = email, FullName = "Maria Convidada", TeamId = teamId, Role = Roles.USER });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);

        var token = _factory.Emails.InviteTokenFor(email);
        Assert.False(string.IsNullOrWhiteSpace(token));

        var anonymous = _factory.CreateClient();

        var lookup = await anonymous.PostAsJsonAsync("api/Invite/lookup", new RequestInviteTokenJson { Token = token });
        Assert.Equal(HttpStatusCode.OK, lookup.StatusCode);
        var lookupBody = await ReadJson(lookup);
        Assert.Equal(email, lookupBody.GetProperty("email").GetString());
        Assert.Equal("Maria Convidada", lookupBody.GetProperty("fullName").GetString());

        var weak = await anonymous.PostAsJsonAsync("api/Invite/accept", new RequestAcceptInviteJson { Token = token, FullName = "Maria Convidada", Password = "123" });
        Assert.Equal(HttpStatusCode.BadRequest, weak.StatusCode);

        var accept = await anonymous.PostAsJsonAsync("api/Invite/accept", new RequestAcceptInviteJson { Token = token, FullName = "Maria S.", Password = StrongPassword });
        Assert.Equal(HttpStatusCode.Created, accept.StatusCode);
        var user = await ReadJson(accept);
        Assert.Equal(Roles.USER, user.GetProperty("role").GetString());

        // Entra no time e consegue autenticar.
        var login = await anonymous.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = email, Password = StrongPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        var team = await ReadJson(await admin.GetAsync($"api/Team/{teamId}"));
        Assert.Contains(team.GetProperty("members").EnumerateArray(), m => m.GetProperty("email").GetString() == email);

        // Token de uso único.
        var reuse = await anonymous.PostAsJsonAsync("api/Invite/accept", new RequestAcceptInviteJson { Token = token, FullName = "X Y", Password = StrongPassword });
        Assert.Equal(HttpStatusCode.NotFound, reuse.StatusCode);
    }

    [Fact]
    public async Task Invite_LeaderCannotInviteElevatedRole_OrOtherTeam_OrMemberCannotInvite()
    {
        var (teamId, admin, leader) = await TeamWithLeader();
        var (otherTeamId, _, _) = await TeamWithLeader();

        var elevated = await leader.PostAsJsonAsync("api/Invite", new RequestInviteJson { Email = NewEmail(), FullName = "A B", TeamId = teamId, Role = Roles.LEADER });
        var otherTeam = await leader.PostAsJsonAsync("api/Invite", new RequestInviteJson { Email = NewEmail(), FullName = "A B", TeamId = otherTeamId, Role = Roles.USER });

        var member = await CreateUserWithClient(_factory, admin, Roles.USER);
        var byMember = await member.Client.PostAsJsonAsync("api/Invite", new RequestInviteJson { Email = NewEmail(), FullName = "A B", TeamId = teamId, Role = Roles.USER });

        Assert.Equal(HttpStatusCode.Forbidden, elevated.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, otherTeam.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, byMember.StatusCode);
    }

    [Fact]
    public async Task Invite_ExistingUserEmail_IsConflict()
    {
        var (teamId, _, leader) = await TeamWithLeader();

        var response = await leader.PostAsJsonAsync("api/Invite", new RequestInviteJson
        {
            Email = TrilhoWebApplicationFactory.MemberEmail,
            FullName = "Já Existe",
            TeamId = teamId,
            Role = Roles.USER
        });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Invite_Resend_InvalidatesPreviousToken()
    {
        var (teamId, _, leader) = await TeamWithLeader();
        var email = NewEmail();
        var request = new RequestInviteJson { Email = email, FullName = "Reenvio Teste", TeamId = teamId, Role = Roles.USER };

        await leader.PostAsJsonAsync("api/Invite", request);
        var firstToken = _factory.Emails.InviteTokenFor(email);

        await leader.PostAsJsonAsync("api/Invite", request);
        var secondToken = _factory.Emails.InviteTokenFor(email);

        var anonymous = _factory.CreateClient();
        var first = await anonymous.PostAsJsonAsync("api/Invite/lookup", new RequestInviteTokenJson { Token = firstToken });
        var second = await anonymous.PostAsJsonAsync("api/Invite/lookup", new RequestInviteTokenJson { Token = secondToken });

        Assert.NotEqual(firstToken, secondToken);
        Assert.Equal(HttpStatusCode.NotFound, first.StatusCode);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
    }

    [Fact]
    public async Task Invite_CancelAndListPending()
    {
        var (teamId, _, leader) = await TeamWithLeader();
        var email = NewEmail();

        var create = await leader.PostAsJsonAsync("api/Invite", new RequestInviteJson { Email = email, FullName = "Cancelar Teste", TeamId = teamId, Role = Roles.USER });
        var inviteId = (await ReadJson(create)).GetProperty("id").GetInt64();
        var token = _factory.Emails.InviteTokenFor(email);

        var pending = await ReadJson(await leader.GetAsync("api/Invite"));
        Assert.Contains(pending.EnumerateArray(), i => i.GetProperty("id").GetInt64() == inviteId);

        var cancel = await leader.DeleteAsync($"api/Invite/{inviteId}");
        Assert.Equal(HttpStatusCode.NoContent, cancel.StatusCode);

        var lookup = await _factory.CreateClient().PostAsJsonAsync("api/Invite/lookup", new RequestInviteTokenJson { Token = token });
        Assert.Equal(HttpStatusCode.NotFound, lookup.StatusCode);
    }

    [Fact]
    public async Task Invite_InvalidToken_IsNotFound()
    {
        await _factory.EnsureSeeded();

        var response = await _factory.CreateClient().PostAsJsonAsync("api/Invite/lookup", new RequestInviteTokenJson { Token = "token-que-nao-existe" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ---- Redefinição de senha

    private async Task<string> CreateUserEmail()
    {
        var admin = await Admin(_factory);
        var request = RequestUserJsonBuilder.Build(Roles.USER);
        (await admin.PostAsJsonAsync("api/User", request)).EnsureSuccessStatusCode();

        return request.Email;
    }

    [Fact]
    public async Task PasswordReset_FullFlow_ChangesPassword_AndCodeIsSingleUse()
    {
        var email = await CreateUserEmail();
        var anonymous = _factory.CreateClient();

        var request = await anonymous.PostAsJsonAsync("api/PasswordReset/request", new RequestPasswordResetJson { Email = email });
        Assert.Equal(HttpStatusCode.NoContent, request.StatusCode);

        var code = _factory.Emails.ResetCodeFor(email);
        Assert.Equal(6, code.Length);

        var wrong = await anonymous.PostAsJsonAsync("api/PasswordReset/verify", new RequestVerifyResetCodeJson { Email = email, Code = code == "000000" ? "111111" : "000000" });
        Assert.Equal(HttpStatusCode.BadRequest, wrong.StatusCode);

        var verify = await anonymous.PostAsJsonAsync("api/PasswordReset/verify", new RequestVerifyResetCodeJson { Email = email, Code = code });
        Assert.Equal(HttpStatusCode.NoContent, verify.StatusCode);

        var weak = await anonymous.PostAsJsonAsync("api/PasswordReset/confirm", new RequestConfirmPasswordResetJson { Email = email, Code = code, NewPassword = "123" });
        Assert.Equal(HttpStatusCode.BadRequest, weak.StatusCode);

        var confirm = await anonymous.PostAsJsonAsync("api/PasswordReset/confirm", new RequestConfirmPasswordResetJson { Email = email, Code = code, NewPassword = StrongPassword });
        Assert.Equal(HttpStatusCode.NoContent, confirm.StatusCode);

        var newLogin = await anonymous.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = email, Password = StrongPassword });
        var oldLogin = await anonymous.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = email, Password = RequestUserJsonBuilder.ValidPassword });
        Assert.Equal(HttpStatusCode.OK, newLogin.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, oldLogin.StatusCode);

        var reuse = await anonymous.PostAsJsonAsync("api/PasswordReset/confirm", new RequestConfirmPasswordResetJson { Email = email, Code = code, NewPassword = "Outra@Senha2" });
        Assert.Equal(HttpStatusCode.BadRequest, reuse.StatusCode);
    }

    [Fact]
    public async Task PasswordReset_UnknownEmail_LooksIdentical_AndSendsNothing()
    {
        await _factory.EnsureSeeded();
        var email = NewEmail();

        var response = await _factory.CreateClient().PostAsJsonAsync("api/PasswordReset/request", new RequestPasswordResetJson { Email = email });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.False(_factory.Emails.AnyTo(email));
    }

    [Fact]
    public async Task PasswordReset_TooManyWrongAttempts_InvalidatesTheCode()
    {
        var email = await CreateUserEmail();
        var anonymous = _factory.CreateClient();
        await anonymous.PostAsJsonAsync("api/PasswordReset/request", new RequestPasswordResetJson { Email = email });
        var code = _factory.Emails.ResetCodeFor(email);
        var wrongCode = code == "000000" ? "111111" : "000000";

        for (var attempt = 0; attempt < 5; attempt++)
        {
            var wrong = await anonymous.PostAsJsonAsync("api/PasswordReset/verify", new RequestVerifyResetCodeJson { Email = email, Code = wrongCode });
            Assert.Equal(HttpStatusCode.BadRequest, wrong.StatusCode);
        }

        var correct = await anonymous.PostAsJsonAsync("api/PasswordReset/verify", new RequestVerifyResetCodeJson { Email = email, Code = code });
        Assert.Equal(HttpStatusCode.BadRequest, correct.StatusCode);
    }

    [Fact]
    public async Task PasswordReset_NewRequest_InvalidatesThePreviousCode()
    {
        var email = await CreateUserEmail();
        var anonymous = _factory.CreateClient();

        await anonymous.PostAsJsonAsync("api/PasswordReset/request", new RequestPasswordResetJson { Email = email });
        var firstCode = _factory.Emails.ResetCodeFor(email);

        string secondCode;
        do
        {
            await anonymous.PostAsJsonAsync("api/PasswordReset/request", new RequestPasswordResetJson { Email = email });
            secondCode = _factory.Emails.ResetCodeFor(email);
        }
        while (secondCode == firstCode);

        var first = await anonymous.PostAsJsonAsync("api/PasswordReset/verify", new RequestVerifyResetCodeJson { Email = email, Code = firstCode });
        var second = await anonymous.PostAsJsonAsync("api/PasswordReset/verify", new RequestVerifyResetCodeJson { Email = email, Code = secondCode });

        Assert.Equal(HttpStatusCode.BadRequest, first.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, second.StatusCode);
    }
}
