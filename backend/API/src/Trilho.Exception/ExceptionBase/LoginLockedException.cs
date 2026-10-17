using System.Net;

namespace Trilho.Exception.ExceptionBase;
/// <summary>Conta bloqueada temporariamente por senhas erradas seguidas (429, para o front diferenciar de "senha inválida").</summary>
public class LoginLockedException : TrilhoException
{
    public LoginLockedException() : base(ResourceErrorsMessage.LOGIN_LOCKED)
    {

    }

    public override int StatusCode => (int)HttpStatusCode.TooManyRequests;

    public override List<string> GetErrors()
    {
        return [Message];
    }
}
