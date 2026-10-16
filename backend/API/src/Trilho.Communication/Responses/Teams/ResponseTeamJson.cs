using Trilho.Communication.Responses.Users;

namespace Trilho.Communication.Responses.Teams;
public class ResponseTeamJson
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public long LeaderId { get; set; }
    public ResponseUserJson? Leader { get; set; }
    public int MemberCount { get; set; }
    public List<ResponseUserJson> Members { get; set; } = [];

    /// <summary>Tarefas em aberto (não concluídas) do time.</summary>
    public int OpenTasks { get; set; }

    /// <summary>Carga de trabalho em % da capacidade estimada (RF08).</summary>
    public int WorkloadPercent { get; set; }
    public bool IsOverloaded { get; set; }
}
