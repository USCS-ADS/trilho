namespace Trilho.Communication.Requests.Tasks;
public class RequestMoveTaskJson
{
    public string Status { get; set; } = string.Empty;
    /// <summary>Posição (índice, a partir de 0) dentro da coluna de destino.</summary>
    public int Position { get; set; }
}
