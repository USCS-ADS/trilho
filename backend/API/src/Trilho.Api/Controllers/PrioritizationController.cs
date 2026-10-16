using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trilho.Api.Authorization;
using Trilho.Application.UseCases.Prioritization.ApplyRanking;
using Trilho.Application.UseCases.Prioritization.GetRanking;
using Trilho.Application.UseCases.Prioritization.Suggest;
using Trilho.Communication.Requests.Prioritization;
using Trilho.Communication.Responses;
using Trilho.Communication.Responses.Prioritization;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PrioritizationController : ControllerBase
{
    /// <summary>Ranking das tarefas em aberto com prioridade sugerida e justificativa. Urgentes ficam sempre no topo.</summary>
    [HttpGet]
    [Route("ranking")]
    [ProducesResponseType(typeof(List<ResponseRankedTaskJson>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetRanking([FromServices] IGetRankingUseCase useCase, [FromQuery] long? teamId)
    {
        var response = await useCase.Execute(teamId);

        return Ok(response);
    }

    /// <summary>Sugestão para uma nova tarefa: prioridade pelo prazo e responsável com menos tarefas em aberto.</summary>
    [HttpPost]
    [Route("suggest")]
    [ProducesResponseType(typeof(ResponsePrioritySuggestionJson), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Suggest([FromServices] ISuggestUseCase useCase, [FromBody] RequestSuggestionJson request)
    {
        var response = await useCase.Execute(request);

        return Ok(response);
    }

    /// <summary>Aplica as prioridades sugeridas às tarefas em aberto do time (líder do time ou administrador).</summary>
    [HttpPost]
    [Route("apply")]
    [Authorize(Policy = Policies.LeaderOrAdmin)]
    [ProducesResponseType(typeof(ResponseApplyRankingJson), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Apply([FromServices] IApplyRankingUseCase useCase, [FromBody] RequestApplyRankingJson request)
    {
        var response = await useCase.Execute(request);

        return Ok(response);
    }
}
