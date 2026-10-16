using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Trilho.Api.Extensions;
using Trilho.Application.UseCases.Users.Login;
using Trilho.Application.UseCases.Users.Profile;
using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses;
using Trilho.Communication.Responses.Users;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitingExtension.AuthPolicy)]
    [ProducesResponseType(typeof(ResponseUserLoginJson), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromServices] ILoginUseCase useCase, [FromBody] RequestUserLoginJson request)
    {
        var response = await useCase.Execute(request);

        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ResponseUserJson), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Me([FromServices] IGetProfileUseCase useCase)
    {
        var response = await useCase.Execute();

        return Ok(response);
    }
}
