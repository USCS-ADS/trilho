using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Services.Email;
using Trilho.Infrastructure.DataAcess;

namespace WebApi.Test;
public class TrilhoWebApplicationFactory : WebApplicationFactory<Program>
{
    public const string AdminEmail = "admin@trilho.test";
    public const string MemberEmail = "member@trilho.test";
    public const string Password = "Trilho@2026";

    private readonly string _databaseName = Guid.NewGuid().ToString();
    private bool _seeded;

    public CapturingEmailSender Emails { get; } = new();

    static TrilhoWebApplicationFactory()
    {
        // Program lê estas chaves antes do Build, por isso variáveis de ambiente (e não ConfigureAppConfiguration).
        Environment.SetEnvironmentVariable("InMemoryTest", "true");
        Environment.SetEnvironmentVariable("Settings__Jwt__SigningKey", "integration-tests-signing-key-0123456789abcdef");
        Environment.SetEnvironmentVariable("Settings__Jwt__ExpiresMinutes", "60");
        // O limite de login (10/min) é desligado na prática: cada teste autentica várias vezes.
        Environment.SetEnvironmentVariable("Settings__RateLimiting__AuthPermitLimit", "100000");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Test");

        builder.ConfigureServices(services =>
        {
            services.AddDbContext<TrilhoDbContext>(options => options.UseInMemoryDatabase(_databaseName));
        });

        // Roda depois do registro do app: o envio real (log) é trocado pelo capturador.
        builder.ConfigureTestServices(services =>
        {
            services.AddSingleton<IEmailSender>(Emails);
        });
    }

    public async Task EnsureSeeded()
    {
        if (_seeded)
        {
            return;
        }

        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<TrilhoDbContext>();
        var encripter = scope.ServiceProvider.GetRequiredService<IPasswordEncripter>();

        context.Users.AddRange(
            NewUser("Admin", AdminEmail, Roles.ADMIN, encripter),
            NewUser("Member", MemberEmail, Roles.USER, encripter));

        await context.SaveChangesAsync();
        _seeded = true;
    }

    private static User NewUser(string name, string email, string role, IPasswordEncripter encripter) => new()
    {
        UserId = Guid.NewGuid(),
        Name = name,
        Email = email,
        Password = encripter.Encrypt(Password),
        Role = role,
        IsActive = true,
        CreatedAt = DateTime.UtcNow
    };
}
