namespace Trilho.Api.Extensions;
public static class CorsExtension
{
    public const string PolicyName = "TrilhoFrontend";

    public static IServiceCollection AddFrontendCors(this IServiceCollection services, IConfiguration configuration)
    {
        var origins = configuration.GetSection("Settings:AllowedOrigins").Get<string[]>() ?? [];

        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
            {
                if (origins.Length > 0)
                {
                    policy.WithOrigins(origins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .WithExposedHeaders("X-Total-Count", "X-Page", "X-Page-Size", "X-Correlation-Id");
                }
            });
        });

        return services;
    }
}
