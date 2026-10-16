namespace Trilho.Domain.Security.Tokens;
public static class TokenClaims
{
    /// <summary>Id numérico do usuário (o mesmo usado nas rotas, ex: api/User/{id}).</summary>
    public const string UserId = "id";
    public const string Role = "role";
    public const string Name = "unique_name";
}
