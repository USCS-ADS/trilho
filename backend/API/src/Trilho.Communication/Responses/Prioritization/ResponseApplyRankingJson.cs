namespace Trilho.Communication.Responses.Prioritization;
public class ResponseApplyRankingJson
{
    public int Updated { get; set; }
    public List<ResponsePriorityChangeJson> Changes { get; set; } = [];
}

public class ResponsePriorityChangeJson
{
    public long TaskId { get; set; }
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
}
