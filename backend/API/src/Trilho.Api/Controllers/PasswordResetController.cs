using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Trilho.Api.Extensions;
using Trilho.Application.UseCases.PasswordReset.Confirm;
using Trilho.Application.UseCases.PasswordReset.Request;
using Trilho.Application.UseCases.PasswordReset.Verify;
using Trilho.Communication.Requests.PasswordReset;
using Trilho.Communication.Responses;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
[AllowAnonymous]
[EnableRateLimiting(RateLimitingExtension.AuthPolicy)]
public class PasswordResetController : ControllerBase
{
    /// <summary>Envia o código por e-mail. Resposta idêntica para e-mails inexistentes (não revela cadastros).</summary>
    [HttpPost]
    [Route("request")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RequestCode([FromServices] IRequestPasswordResetUseCase useCase, [FromBody] RequestPasswordResetJson request)
    {
        await useCase.Execute(request);

        return NoContent();
    }

    /// <summary>Confere o código (passo 2 da tela) sem consumi-lo.</summary>
    [HttpPost]
    [Route("verify")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Verify([FromServices] IVerifyPasswordResetCodeUseCase useCase, [FromBody] RequestVerifyResetCodeJson request)
    {
        await useCase.Execute(request);

        return NoContent();
    }

    /// <summary>Define a nova senha com o código (passo 3 da tela); o código é consumido.</summary>
    [HttpPost]
    [Route("confirm")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Confirm([FromServices] IConfirmPasswordResetUseCase useCase, [FromBody] RequestConfirmPasswordResetJson request)
    {
        await useCase.Execute(request);

        return NoContent();
    }
}
