namespace Trilho.Communication.Responses.Prioritization;
public class ResponsePrioritySuggestionJson
{
    public string Priority { get; set; } = string.Empty;
    public string Justification { get; set; } = string.Empty;
    public ResponseAssigneeSuggestionJson? SuggestedAssignee { get; set; }
}

public class ResponseAssigneeSuggestionJson
{
    public long UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int OpenTasks { get; set; }
}
