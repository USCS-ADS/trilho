using System.Net;

namespace Trilho.Exception.ExceptionBase;
public class ForbiddenException : TrilhoException
{
    public ForbiddenException(string message) : base(message)
    {

    }

    public override int StatusCode => (int)HttpStatusCode.Forbidden;

    public override List<string> GetErrors()
    {
        return [Message];
    }
}
