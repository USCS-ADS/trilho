using Microsoft.AspNetCore.DataProtection;
using Trilho.Domain.Security.Cryptography;

namespace Trilho.Infrastructure.Security;
internal class DataProtectionSecretProtector : ISecretProtector
{
    private readonly IDataProtector _protector;

    public DataProtectionSecretProtector(IDataProtectionProvider provider)
    {
        _protector = provider.CreateProtector("Trilho.GitWebhookSecret.v1");
    }

    public string Protect(string secret) => _protector.Protect(secret);

    public string Unprotect(string protectedSecret) => _protector.Unprotect(protectedSecret);
}
