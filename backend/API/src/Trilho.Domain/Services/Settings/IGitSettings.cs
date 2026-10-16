namespace Trilho.Domain.Services.Settings;
public interface IGitSettings
{
    /// <summary>Tentativas de processamento antes de o evento ser abandonado.</summary>
    int MaxAttempts { get; }

    /// <summary>URL que o provedor deve chamar para o repositório (usa Settings:PublicApiBaseUrl quando configurada).</summary>
    string BuildWebhookUrl(long repositoryId);
}
