namespace Trilho.Communication.Responses.Dashboard;
public class ResponseDashboardJson
{
    public int ActiveTasks { get; set; }
    public int CompletedInCurrentSprint { get; set; }
    public int OverdueTasks { get; set; }
    public int ActiveTeams { get; set; }
    public int AlertThresholdPercent { get; set; }
    public List<ResponseStatusCountJson> TasksByStatus { get; set; } = [];
    public List<ResponseTeamWorkloadJson> TeamWorkloads { get; set; } = [];
    public List<ResponseSprintJson> Sprints { get; set; } = [];
}

public class ResponseStatusCountJson
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class ResponseTeamWorkloadJson
{
    public long TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public int MemberCount { get; set; }
    public int OpenTasks { get; set; }
    public int Capacity { get; set; }
    /// <summary>Tarefas em aberto ÷ capacidade (membros × tarefas por membro) × 100.</summary>
    public int WorkloadPercent { get; set; }
    public bool IsOverloaded { get; set; }
}

public class ResponseSprintJson
{
    public string Label { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int Completed { get; set; }
    public bool IsCurrent { get; set; }
}
