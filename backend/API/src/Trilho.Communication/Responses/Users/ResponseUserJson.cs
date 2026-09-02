namespace Trilho.Communication.Responses.Users;
public class ResponseUserJson
{
    public long Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
