using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Security.Tokens;
using Trilho.Infrastructure.DataAcess;
using Trilho.Infrastructure.DataAcess.Repositories;
using Trilho.Infrastructure.Security.Token;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;


namespace Trilho.Infrastructure;
public static class DependencyInjectionExtension
{
    public static void AddInfrasctructure(this IServiceCollection services, IConfiguration configuration)
    {
        AddDbContext(services, configuration);
        AddRepositories(services);
        AddToken(services, configuration);
        services.AddScoped<IPasswordEncripter, Security.BCrypt>();
    }

    private static void AddToken(IServiceCollection services, IConfiguration configuration)
    {
        var expirationTimeMinutes = configuration.GetValue<uint>("Settings:Jwt:ExpiresMinutes");
        var signingKey = configuration.GetValue<string>("Settings:Jwt:SigningKey");

        services.AddScoped<IAcessTokenGenerator>(config => new JwtTokenGenerator(expirationTimeMinutes, signingKey!));
    }

    private static void AddRepositories(IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork , UnitOfWork>();
        services.AddScoped<IUserWriteOnlyRepository, UserRepository>();
        services.AddScoped<IUserUpdateOnlyRepository, UserRepository>();
        services.AddScoped<IUserReadOnlyRepository, UserRepository>();
    }

    private static void AddDbContext(IServiceCollection services, IConfiguration configuration)
    {

        var connectionString = configuration.GetConnectionString("Connection");

        var version = new Version(8, 0, 35);
        var serverVersion = new MySqlServerVersion(version);

        services.AddDbContext<TrilhoDbContext>(config => config.UseMySql(connectionString, serverVersion));
    }
}
