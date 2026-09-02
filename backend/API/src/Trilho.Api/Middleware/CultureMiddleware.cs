using System.Globalization;

namespace Trilho.Api.Middleware;

public class CultureMiddleware
{
    private readonly RequestDelegate _next;
    public CultureMiddleware(RequestDelegate next)
    {
        _next = next;
    }
    public async Task Invoke(HttpContext context)
    {

        var supportedLenguages = CultureInfo.GetCultures(CultureTypes.AllCultures).ToList();

        var requestedCulture = context.Request.Headers.AcceptLanguage.FirstOrDefault();



        var cultureInfo = new CultureInfo("en");

        if (string.IsNullOrWhiteSpace(requestedCulture) == false && supportedLenguages.Exists(lenguage => lenguage.Name.Equals(requestedCulture)))
        {
            cultureInfo = new CultureInfo(requestedCulture);
        }

        CultureInfo.CurrentCulture = cultureInfo;
        CultureInfo.CurrentUICulture = cultureInfo;

        await _next(context);
    }
}
