using Microsoft.Extensions.Configuration;

namespace Trilho.Infrastructure.Extensions;
public static class ConfigurationExtension
{
    /// <summary>
    /// Verdadeiro nos testes de integração: o banco real (MySQL) não é registrado e a
    /// fábrica de testes injeta um DbContext em memória. Chave: <c>InMemoryTest</c>.
    /// </summary>
    public static bool IsTestEnvironment(this IConfiguration configuration)
    {
        return configuration.GetValue<bool>("InMemoryTest");
    }
}
