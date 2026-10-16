namespace Trilho.Communication.Responses.Users;
public class ResponseUserListJson
{
    public List<ResponseUserJson> Users { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
