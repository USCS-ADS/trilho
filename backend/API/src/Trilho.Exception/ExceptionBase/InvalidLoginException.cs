using System.Net;

namespace Trilho.Exception.ExceptionBase;
public class InvalidLoginException : TrilhoException
{
    public InvalidLoginException() : base(ResourceErrorsMessage.EMAIL_OR_PASSWORD_INVALID)
    {

    }
    public override int StatusCode => (int)HttpStatusCode.Unauthorized;

    public override List<string> GetErrors()
    {
        return [Message];
    }
}
