using System.Net;

namespace Trilho.Exception.ExceptionBase;
public class ConflictException : TrilhoException
{
    public ConflictException(string message) : base(message)
    {

    }

    public override int StatusCode => (int)HttpStatusCode.Conflict;

    public override List<string> GetErrors()
    {
        return [Message];
    }
}
