namespace Trilho.Domain.Security.Cryptography;
/// <summary>Cifra segredos que precisam ser recuperados em texto (ex: segredo do webhook para validar HMAC).</summary>
public interface ISecretProtector
{
    string Protect(string secret);
    string Unprotect(string protectedSecret);
}
