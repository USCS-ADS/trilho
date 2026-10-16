namespace Trilho.Domain.Security.Tokens;
public interface ISecureTokenGenerator
{
    /// <summary>Token aleatório criptograficamente seguro, seguro para URL.</summary>
    string GenerateToken();

    /// <summary>Hash determinístico do token (o token em si nunca é guardado).</summary>
    string HashToken(string token);

    /// <summary>Código numérico aleatório com zeros à esquerda (ex: 042913).</summary>
    string GenerateNumericCode(int digits);
}
