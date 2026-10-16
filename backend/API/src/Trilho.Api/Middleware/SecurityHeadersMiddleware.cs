namespace Trilho.Api.Middleware;
/// <summary>Cabeçalhos de segurança padrão para uma API JSON.</summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public Task Invoke(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;
            var isSwagger = context.Request.Path.StartsWithSegments("/swagger");

            headers["X-Content-Type-Options"] = "nosniff";
            headers["X-Frame-Options"] = "DENY";
            headers["Referrer-Policy"] = "no-referrer";

            if (isSwagger == false)
            {
                headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";

                // Dados da API são privados: nada de cache compartilhado.
                if (headers.ContainsKey("Cache-Control") == false)
                {
                    headers["Cache-Control"] = "no-store";
                }
            }

            return Task.CompletedTask;
        });

        return _next(context);
    }
}
