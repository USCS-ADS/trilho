using System.Net;

namespace Trilho.Exception.ExceptionBase;
public class NotFoundException : TrilhoException
{
    public NotFoundException(string message) : base(message)
    {

    }

    public override int StatusCode => (int)HttpStatusCode.NotFound;

    public override List<string> GetErrors()
    {
        return [Message];
    }
}
