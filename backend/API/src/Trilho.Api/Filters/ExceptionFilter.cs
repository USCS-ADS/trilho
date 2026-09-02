using Trilho.Communication.Responses;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Trilho.Api.Filters;

public class ExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        if (context.Exception is TrilhoException)
        {
            HandleProjectExcpetion(context);
        }
        else
        {
            ThrowUnknowError(context);
        }
    }

    private void HandleProjectExcpetion(ExceptionContext context)
    {
        var trilhoException = context.Exception as TrilhoException;
        var errorRespose = new ResponseErrorJson(trilhoException!.GetErrors());

        context.HttpContext.Response.StatusCode = trilhoException.StatusCode;
        context.Result = new ObjectResult(errorRespose);

    }

    private void ThrowUnknowError(ExceptionContext context)
    {
        var errorRespose = new ResponseErrorJson(ResourceErrorsMessage.UNKNOWN_ERROR);
        context.HttpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Result = new ObjectResult(errorRespose);

    }
}
