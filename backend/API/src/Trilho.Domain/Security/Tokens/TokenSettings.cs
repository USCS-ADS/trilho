namespace Trilho.Domain.Security.Tokens;
public static class TokenSettings
{
    /// <summary>Emissor/audiência padrão do JWT; sobrescrevíveis em Settings:Jwt:Issuer / Audience.</summary>
    public const string DefaultIssuer = "trilho-api";
    public const string DefaultAudience = "trilho-app";
}
