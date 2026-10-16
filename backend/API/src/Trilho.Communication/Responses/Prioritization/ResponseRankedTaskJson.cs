namespace Trilho.Communication.Responses.Prioritization;
public class ResponseRankedTaskJson
{
    /// <summary>Posição no ranking (1 = mais prioritária).</summary>
    public int Rank { get; set; }
    public long TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public long TeamId { get; set; }
    public long? AssigneeId { get; set; }
    public DateOnly? DueDate { get; set; }
    public string CurrentPriority { get; set; } = string.Empty;
    public string SuggestedPriority { get; set; } = string.Empty;
    /// <summary>Justificativa em linguagem simples (RF07).</summary>
    public string Justification { get; set; } = string.Empty;
}
