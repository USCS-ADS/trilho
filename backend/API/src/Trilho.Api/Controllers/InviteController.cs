using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Trilho.Api.Authorization;
using Trilho.Api.Extensions;
using Trilho.Application.UseCases.Invites.Accept;
using Trilho.Application.UseCases.Invites.Cancel;
using Trilho.Application.UseCases.Invites.Create;
using Trilho.Application.UseCases.Invites.GetPending;
using Trilho.Application.UseCases.Invites.Lookup;
using Trilho.Communication.Requests.Invites;
using Trilho.Communication.Responses;
using Trilho.Communication.Responses.Invites;
using Trilho.Communication.Responses.Users;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class InviteController : ControllerBase
{
    /// <summary>Cria (ou reenvia) o convite; o link de ativação segue por e-mail.</summary>
    [HttpPost]
    [Authorize(Policy = Policies.LeaderOrAdmin)]
    [ProducesResponseType(typeof(ResponseInviteJson), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromServices] ICreateInviteUseCase useCase, [FromBody] RequestInviteJson request)
    {
        var response = await useCase.Execute(request);

        return Created(string.Empty, response);
    }

    [HttpGet]
    [Authorize(Policy = Policies.LeaderOrAdmin)]
    [ProducesResponseType(typeof(List<ResponseInviteJson>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> GetPending([FromServices] IGetPendingInviteUseCase useCase)
    {
        var response = await useCase.Execute();

        if (response.Count != 0)
        {
            return Ok(response);
        }

        return NoContent();
    }

    [HttpDelete]
    [Route("{id}")]
    [Authorize(Policy = Policies.LeaderOrAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel([FromServices] ICancelInviteUseCase useCase, [FromRoute] long id)
    {
        await useCase.Execute(id);

        return NoContent();
    }

    /// <summary>Dados do convite para a tela de ativação. O token vai no corpo para não aparecer em logs de acesso.</summary>
    [HttpPost]
    [Route("lookup")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitingExtension.AuthPolicy)]
    [ProducesResponseType(typeof(ResponseInviteLookupJson), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Lookup([FromServices] ILookupInviteUseCase useCase, [FromBody] RequestInviteTokenJson request)
    {
        var response = await useCase.Execute(request);

        return Ok(response);
    }

    /// <summary>Ativa a conta: cria o usuário com o perfil do convite e o adiciona ao time.</summary>
    [HttpPost]
    [Route("accept")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitingExtension.AuthPolicy)]
    [ProducesResponseType(typeof(ResponseUserJson), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Accept([FromServices] IAcceptInviteUseCase useCase, [FromBody] RequestAcceptInviteJson request)
    {
        var response = await useCase.Execute(request);

        return Created(string.Empty, response);
    }
}
