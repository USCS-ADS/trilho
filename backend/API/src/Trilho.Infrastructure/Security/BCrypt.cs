using Trilho.Domain.Security.Cryptography;
using BC = BCrypt.Net.BCrypt;

namespace Trilho.Infrastructure.Security;
internal class BCrypt : IPasswordEncripter
{
    public string Encrypt(string password)
    {
        string passwordHash = BC.HashPassword(password);

        return passwordHash;
    }

    public bool Verify(string password, string passwordHash)
    {
        return BC.Verify(password, passwordHash);
    }
}
