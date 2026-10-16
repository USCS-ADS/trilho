using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Trilho.Api.Authorization;
using Trilho.Domain.Enum;
using Trilho.Domain.Security.Tokens;

namespace Trilho.Api.Extensions;
public static class AuthenticationExtension
{
    private const int MinimumSigningKeyLength = 32;

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var signingKey = configuration.GetValue<string>("Settings:Jwt:SigningKey");
        var issuer = configuration.GetValue<string>("Settings:Jwt:Issuer") ?? TokenSettings.DefaultIssuer;
        var audience = configuration.GetValue<string>("Settings:Jwt:Audience") ?? TokenSettings.DefaultAudience;

        // Falha na subida em vez de aceitar uma chave vazia/fraca (o token seria forjável).
        if (string.IsNullOrWhiteSpace(signingKey) || signingKey.Length < MinimumSigningKeyLength)
        {
            throw new InvalidOperationException(
                $"Settings:Jwt:SigningKey must be configured with at least {MinimumSigningKeyLength} characters (use user-secrets or environment variables).");
        }

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = issuer,
                    ValidateAudience = true,
                    ValidAudience = audience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ClockSkew = TimeSpan.Zero,
                    NameClaimType = TokenClaims.Name,
                    RoleClaimType = TokenClaims.Role,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey))
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy(Policies.AdminOnly, policy => policy.RequireRole(Roles.ADMIN));
            options.AddPolicy(Policies.LeaderOrAdmin, policy => policy.RequireRole(Roles.ADMIN, Roles.LEADER));
        });

        return services;
    }
}
