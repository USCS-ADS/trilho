using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Trilho.Application.UseCases.Users.Login;
using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses;
using Trilho.Communication.Responses.Users;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ResponseUserLoginJson), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromServices] ILoginUseCase useCase, [FromBody] RequestUserLoginJson request)
    {
        var response = await useCase.Execute(request);

        return Ok(response);
    }
}
