namespace Trilho.Communication.Responses.Tasks;
public class ResponseTaskListJson
{
    public List<ResponseTaskSummaryJson> Tasks { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
