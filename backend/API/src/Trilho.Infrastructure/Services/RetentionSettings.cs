using Microsoft.Extensions.Configuration;
using Trilho.Domain.Services.Settings;

namespace Trilho.Infrastructure.Services;
internal class RetentionSettings : IRetentionSettings
{
    public RetentionSettings(IConfiguration configuration)
    {
        GitEventsDays = Math.Max(1, configuration.GetValue<int?>("Settings:Retention:GitEventsDays") ?? 30);
        AuthFlowDays = Math.Max(1, configuration.GetValue<int?>("Settings:Retention:AuthFlowDays") ?? 7);
    }

    public int GitEventsDays { get; }
    public int AuthFlowDays { get; }
}
