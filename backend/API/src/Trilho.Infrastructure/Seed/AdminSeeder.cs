using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;

namespace Trilho.Infrastructure.Seed;
public static class AdminSeeder
{
    /// <summary>
    /// Cria o administrador inicial a partir de <c>Settings:SeedAdmin</c> (Name, Email, Password).
    /// Necessário porque o cadastro de usuários exige um administrador autenticado.
    /// Idempotente: não faz nada se não houver configuração ou se o e-mail já existir.
    /// </summary>
    public static async Task Seed(IServiceProvider serviceProvider, IConfiguration configuration)
    {
        var section = configuration.GetSection("Settings:SeedAdmin");

        var email = section["Email"]?.Trim().ToLowerInvariant();
        var password = section["Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        await using var scope = serviceProvider.CreateAsyncScope();

        var readRepository = scope.ServiceProvider.GetRequiredService<IUserReadOnlyRepository>();

        if (await readRepository.ExistsUserWithEmail(email))
        {
            return;
        }

        var writeRepository = scope.ServiceProvider.GetRequiredService<IUserWriteOnlyRepository>();
        var passwordEncripter = scope.ServiceProvider.GetRequiredService<IPasswordEncripter>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var admin = new User
        {
            UserId = Guid.NewGuid(),
            Name = section["Name"] ?? "Administrador",
            Email = email,
            Password = passwordEncripter.Encrypt(password),
            Role = Roles.ADMIN,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await writeRepository.Create(admin);
        await unitOfWork.Commit();
    }
}
