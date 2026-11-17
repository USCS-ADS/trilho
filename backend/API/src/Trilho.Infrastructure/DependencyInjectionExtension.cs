using Microsoft.AspNetCore.DataProtection;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Dashboard;
using Trilho.Domain.Repositories.Git;
using Trilho.Domain.Repositories.Invites;
using Trilho.Domain.Repositories.Maintenance;
using Trilho.Domain.Repositories.Notifications;
using Trilho.Domain.Repositories.PasswordReset;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Security.Tokens;
using Trilho.Domain.Services.Email;
using Trilho.Domain.Services.Git;
using Trilho.Infrastructure.Services.Git;
using Trilho.Domain.Services.Settings;
using Trilho.Infrastructure.Services;
using Trilho.Infrastructure.Services.Email;
using Trilho.Infrastructure.DataAcess;
using Trilho.Infrastructure.DataAcess.Repositories;
using Trilho.Infrastructure.Extensions;
using Trilho.Infrastructure.Security.Token;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;


namespace Trilho.Infrastructure;
public static class DependencyInjectionExtension
{
    public static void AddInfrasctructure(this IServiceCollection services, IConfiguration configuration)
    {
        AddRepositories(services);
        AddToken(services, configuration);
        services.AddScoped<IPasswordEncripter, Security.BCrypt>();
        services.AddSingleton<ISecureTokenGenerator, Security.SecureTokenGenerator>();
        services.AddSingleton<IAuthFlowSettings, AuthFlowSettings>();
        services.AddSingleton<IPlanningSettings, PlanningSettings>();
        services.AddSingleton<IGitSettings, GitSettings>();
        services.AddSingleton<IRetentionSettings, RetentionSettings>();

        AddGit(services, configuration);
        AddEmail(services, configuration);

        // Nos testes de integração o DbContext é registrado pela fábrica (em memória).
        if (configuration.IsTestEnvironment() == false)
        {
            AddDbContext(services, configuration);
        }
    }

    private static void AddToken(IServiceCollection services, IConfiguration configuration)
    {
        var expirationTimeMinutes = configuration.GetValue<uint>("Settings:Jwt:ExpiresMinutes");
        var signingKey = configuration.GetValue<string>("Settings:Jwt:SigningKey");

        var issuer = configuration.GetValue<string>("Settings:Jwt:Issuer") ?? TokenSettings.DefaultIssuer;
        var audience = configuration.GetValue<string>("Settings:Jwt:Audience") ?? TokenSettings.DefaultAudience;

        services.AddScoped<IAcessTokenGenerator>(config => new JwtTokenGenerator(expirationTimeMinutes, signingKey!, issuer, audience));
    }

    private static void AddRepositories(IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork , UnitOfWork>();
        services.AddScoped<IUserWriteOnlyRepository, UserRepository>();
        services.AddScoped<IUserUpdateOnlyRepository, UserRepository>();
        services.AddScoped<IUserReadOnlyRepository, UserRepository>();

        services.AddScoped<ITeamWriteOnlyRepository, TeamRepository>();
        services.AddScoped<ITeamUpdateOnlyRepository, TeamRepository>();
        services.AddScoped<ITeamReadOnlyRepository, TeamRepository>();

        services.AddScoped<ITaskWriteOnlyRepository, TaskRepository>();
        services.AddScoped<ITaskUpdateOnlyRepository, TaskRepository>();
        services.AddScoped<ITaskReadOnlyRepository, TaskRepository>();

        services.AddScoped<IInviteWriteOnlyRepository, InviteRepository>();
        services.AddScoped<IInviteUpdateOnlyRepository, InviteRepository>();
        services.AddScoped<IInviteReadOnlyRepository, InviteRepository>();

        services.AddScoped<IPasswordResetWriteOnlyRepository, PasswordResetRepository>();
        services.AddScoped<IPasswordResetUpdateOnlyRepository, PasswordResetRepository>();

        services.AddScoped<INotificationWriteOnlyRepository, NotificationRepository>();
        services.AddScoped<INotificationUpdateOnlyRepository, NotificationRepository>();
        services.AddScoped<INotificationReadOnlyRepository, NotificationRepository>();

        services.AddScoped<IDashboardReadOnlyRepository, DashboardRepository>();
        services.AddScoped<IMaintenanceRepository, MaintenanceRepository>();

        services.AddScoped<IGitRepositoryWriteOnlyRepository, GitRepositoryRepository>();
        services.AddScoped<IGitRepositoryUpdateOnlyRepository, GitRepositoryRepository>();
        services.AddScoped<IGitRepositoryReadOnlyRepository, GitRepositoryRepository>();

        services.AddScoped<IPendingGitEventWriteOnlyRepository, PendingGitEventRepository>();
        services.AddScoped<IPendingGitEventUpdateOnlyRepository, PendingGitEventRepository>();
    }

    /// <summary>
    /// <c>Settings:Email:Provider</c>: "Log" (padrão, só registra no log — desenvolvimento) ou "Smtp" (envio real).
    /// </summary>
    private static void AddEmail(IServiceCollection services, IConfiguration configuration)
    {
        var provider = configuration.GetValue<string>("Settings:Email:Provider") ?? "Log";

        if (provider.Equals("Smtp", StringComparison.OrdinalIgnoreCase))
        {
            var settings = SmtpSettings.From(configuration);
            settings.EnsureValid();

            services.AddSingleton(settings);
            services.AddSingleton<IEmailSender, SmtpEmailSender>();

            return;
        }

        if (provider.Equals("Log", StringComparison.OrdinalIgnoreCase) == false)
        {
            throw new InvalidOperationException($"Settings:Email:Provider inválido: '{provider}'. Use 'Log' ou 'Smtp'.");
        }

        services.AddSingleton<IEmailSender, LogEmailSender>();
    }

    private static void AddGit(IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IGitProvider, GitHubProvider>();
        services.AddSingleton<IGitProvider, GitLabProvider>();

        // Os segredos de webhook são cifrados com Data Protection. Em produção, aponte
        // Settings:DataProtectionKeysPath para um volume persistente, ou os segredos ficam ilegíveis após reiniciar.
        var dataProtection = services.AddDataProtection().SetApplicationName("Trilho");
        var keysPath = configuration.GetValue<string>("Settings:DataProtectionKeysPath");

        if (string.IsNullOrWhiteSpace(keysPath) == false)
        {
            dataProtection.PersistKeysToFileSystem(new DirectoryInfo(keysPath));
        }

        services.AddSingleton<Domain.Security.Cryptography.ISecretProtector, Security.DataProtectionSecretProtector>();
    }

    private static void AddDbContext(IServiceCollection services, IConfiguration configuration)
    {

        var connectionString = configuration.GetConnectionString("Connection");

        var version = new Version(8, 0, 35);
        var serverVersion = new MySqlServerVersion(version);

        services.AddDbContext<TrilhoDbContext>(config => config.UseMySql(connectionString, serverVersion));

        // Prontidão: a API só está "pronta" se o banco responde (liveness é /health, sem dependências).
        services.AddHealthChecks().AddDbContextCheck<TrilhoDbContext>("database", tags: ["ready"]);
    }
}
