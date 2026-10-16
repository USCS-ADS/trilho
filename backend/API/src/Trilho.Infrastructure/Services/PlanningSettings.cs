using Microsoft.Extensions.Configuration;
using Trilho.Domain.Services.Settings;

namespace Trilho.Infrastructure.Services;
internal class PlanningSettings : IPlanningSettings
{
    public PlanningSettings(IConfiguration configuration)
    {
        TasksPerMember = Math.Max(1, configuration.GetValue<int?>("Settings:Workload:TasksPerMember") ?? 8);
        AlertThresholdPercent = configuration.GetValue<int?>("Settings:Workload:AlertThresholdPercent") ?? 85;
        SprintLengthDays = Math.Max(1, configuration.GetValue<int?>("Settings:SprintLengthDays") ?? 14);
        DueSoonHours = Math.Max(1, configuration.GetValue<int?>("Settings:Notifications:DueSoonHours") ?? 48);

        var anchor = configuration.GetValue<string>("Settings:SprintAnchorDate");
        SprintAnchorDate = DateOnly.TryParse(anchor, out var parsed) ? parsed : new DateOnly(2026, 8, 3);
    }

    public int TasksPerMember { get; }
    public int AlertThresholdPercent { get; }
    public int SprintLengthDays { get; }
    public DateOnly SprintAnchorDate { get; }
    public int DueSoonHours { get; }
}
