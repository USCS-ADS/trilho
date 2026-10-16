using Microsoft.Extensions.Configuration;
using Trilho.Domain.Services.Settings;

namespace Trilho.Infrastructure.Services;
internal class GitSettings : IGitSettings
{
    private readonly string? _publicApiBaseUrl;

    public GitSettings(IConfiguration configuration)
    {
        MaxAttempts = Math.Max(1, configuration.GetValue<int?>("Settings:Git:MaxAttempts") ?? 5);
        _publicApiBaseUrl = configuration.GetValue<string>("Settings:PublicApiBaseUrl")?.TrimEnd('/');
    }

    public int MaxAttempts { get; }

    public string BuildWebhookUrl(long repositoryId)
    {
        var path = $"/api/GitWebhook/{repositoryId}";

        return string.IsNullOrWhiteSpace(_publicApiBaseUrl) ? path : _publicApiBaseUrl + path;
    }
}
