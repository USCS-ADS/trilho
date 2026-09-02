namespace Trilho.Exception.ExceptionBase;
public abstract class TrilhoException : System.Exception
{
    protected TrilhoException(string message) : base(message)
    {

    }

    public abstract int StatusCode { get; }
    public abstract List<string> GetErrors();
}
