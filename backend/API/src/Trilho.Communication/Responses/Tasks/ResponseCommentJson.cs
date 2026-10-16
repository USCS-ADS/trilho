namespace Trilho.Communication.Responses.Tasks;
public class ResponseCommentJson
{
    public long Id { get; set; }
    public long? AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
