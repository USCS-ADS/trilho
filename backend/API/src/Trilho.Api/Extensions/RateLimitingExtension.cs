using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace Trilho.Api.Extensions;
public static class RateLimitingExtension
{
    public const string AuthPolicy = "auth";
    public const string WebhookPolicy = "webhook";

    public static IServiceCollection AddAuthRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        var permitLimit = configuration.GetValue<int?>("Settings:RateLimiting:AuthPermitLimit") ?? 10;
        var webhookLimit = configuration.GetValue<int?>("Settings:RateLimiting:WebhookPermitLimit") ?? 600;

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.AddPolicy(AuthPolicy, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = permitLimit,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));

            // Webhooks dos provedores Git: limite mais folgado (vários repositórios/pushes), mas ainda protegido.
            options.AddPolicy(WebhookPolicy, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = webhookLimit,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
        });

        return services;
    }
}
