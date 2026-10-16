using System.Net;

namespace Trilho.Exception.ExceptionBase;
public class UnauthorizedException : TrilhoException
{
    public UnauthorizedException(string message) : base(message)
    {

    }

    public override int StatusCode => (int)HttpStatusCode.Unauthorized;

    public override List<string> GetErrors()
    {
        return [Message];
    }
}
