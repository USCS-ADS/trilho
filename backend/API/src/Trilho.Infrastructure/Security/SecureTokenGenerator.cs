using System.Security.Cryptography;
using System.Text;
using Trilho.Domain.Security.Tokens;

namespace Trilho.Infrastructure.Security;
internal class SecureTokenGenerator : ISecureTokenGenerator
{
    public string GenerateToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);

        return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public string HashToken(string token)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(token));

        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public string GenerateNumericCode(int digits)
    {
        var max = (int)Math.Pow(10, digits);

        return RandomNumberGenerator.GetInt32(0, max).ToString().PadLeft(digits, '0');
    }
}
