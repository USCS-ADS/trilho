using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using CommonTestUtilities.Requests;
using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Users;

namespace WebApi.Test;
/// <summary>Atalhos compartilhados pelos testes de integração.</summary>
public static class TestApi
{
    public static async Task<HttpClient> LoginAs(TrilhoWebApplicationFactory factory, string email, string password = TrilhoWebApplicationFactory.Password)
    {
        await factory.EnsureSeeded();

        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("api/Auth", new RequestUserLoginJson { Email = email, Password = password });
        response.EnsureSuccessStatusCode();

        var login = await response.Content.ReadFromJsonAsync<ResponseUserLoginJson>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login!.Token);

        return client;
    }

    public static async Task<HttpClient> Admin(TrilhoWebApplicationFactory factory)
        => await LoginAs(factory, TrilhoWebApplicationFactory.AdminEmail);

    /// <summary>Cria um usuário (como administrador) e devolve um cliente já autenticado como ele.</summary>
    public static async Task<(long Id, HttpClient Client)> CreateUserWithClient(TrilhoWebApplicationFactory factory, HttpClient admin, string role)
    {
        var request = RequestUserJsonBuilder.Build(role);
        var response = await admin.PostAsJsonAsync("api/User", request);
        response.EnsureSuccessStatusCode();

        var body = await ReadJson(response);
        var client = await LoginAs(factory, request.Email, RequestUserJsonBuilder.ValidPassword);

        return (body.GetProperty("id").GetInt64(), client);
    }

    public static async Task<JsonElement> ReadJson(HttpResponseMessage response)
    {
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return document.RootElement.Clone();
    }

    public static string UniqueName(string prefix) => $"{prefix}-{Guid.NewGuid().ToString("N")[..6]}";
}
