using System.Text.RegularExpressions;

namespace Trilho.Api.Middleware;
/// <summary>
/// Dá a cada requisição um identificador de correlação (aceita o do cliente/proxy, se válido),
/// devolve-o em <c>X-Correlation-Id</c> e o coloca no escopo de log, para rastrear erros ponta a ponta.
/// </summary>
public partial class CorrelationIdMiddleware
{
    public const string HeaderName = "X-Correlation-Id";

    [GeneratedRegex(@"^[A-Za-z0-9\-_]{8,64}$")]
    private static partial Regex ValidId();

    private readonly RequestDelegate _next;
    private readonly ILogger<CorrelationIdMiddleware> _logger;

    public CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        var incoming = context.Request.Headers[HeaderName].FirstOrDefault();
        var correlationId = incoming is not null && ValidId().IsMatch(incoming) ? incoming : Guid.NewGuid().ToString("N");

        context.Items[HeaderName] = correlationId;
        context.Response.Headers[HeaderName] = correlationId;

        using (_logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = correlationId }))
        {
            await _next(context);
        }
    }
}
