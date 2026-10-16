using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trilho.Application.UseCases.Git.Repositories.Connect;
using Trilho.Application.UseCases.Git.Repositories.Disconnect;
using Trilho.Application.UseCases.Git.Repositories.GetAll;
using Trilho.Application.UseCases.Git.Repositories.Retry;
using Trilho.Application.UseCases.Git.Repositories.Update;
using Trilho.Communication.Requests.Git;
using Trilho.Communication.Responses;
using Trilho.Communication.Responses.Git;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class GitRepositoryController : ControllerBase
{
    /// <summary>Conecta um repositório a um time. O segredo do webhook só é exibido nesta resposta.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ResponseGitRepositoryCreatedJson), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Connect([FromServices] IConnectRepositoryUseCase useCase, [FromBody] RequestConnectRepositoryJson request)
    {
        var response = await useCase.Execute(request);

        return Created(string.Empty, response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<ResponseGitRepositoryJson>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> GetAll([FromServices] IGetAllRepositoriesUseCase useCase)
    {
        var response = await useCase.Execute();

        if (response.Count != 0)
        {
            return Ok(response);
        }

        return NoContent();
    }

    /// <summary>Altera os eventos escutados (commit, pull_request, merge).</summary>
    [HttpPut]
    [Route("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromServices] IUpdateRepositoryUseCase useCase, [FromRoute] long id, [FromBody] RequestUpdateRepositoryJson request)
    {
        await useCase.Execute(id, request);

        return NoContent();
    }

    [HttpDelete]
    [Route("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Disconnect([FromServices] IDisconnectRepositoryUseCase useCase, [FromRoute] long id)
    {
        await useCase.Execute(id);

        return NoContent();
    }

    /// <summary>Reprocessa agora os eventos pendentes/com falha do repositório.</summary>
    [HttpPost]
    [Route("{id}/retry")]
    [ProducesResponseType(typeof(ResponseGitRunJson), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Retry([FromServices] IRetryRepositoryEventsUseCase useCase, [FromRoute] long id)
    {
        var response = await useCase.Execute(id);

        return Ok(response);
    }
}
