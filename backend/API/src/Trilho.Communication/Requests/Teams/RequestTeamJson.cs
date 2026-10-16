namespace Trilho.Communication.Requests.Teams;
public class RequestTeamJson
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public long LeaderId { get; set; }
}
