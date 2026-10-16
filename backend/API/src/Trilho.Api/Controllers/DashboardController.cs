using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trilho.Api.Authorization;
using Trilho.Application.UseCases.Dashboard.Get;
using Trilho.Communication.Responses.Dashboard;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
[Authorize(Policy = Policies.LeaderOrAdmin)]
public class DashboardController : ControllerBase
{
    /// <summary>Consolidado de tarefas, carga por time e conclusões por sprint (administrador: todos os times; líder: os que lidera).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ResponseDashboardJson), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get([FromServices] IGetDashboardUseCase useCase)
    {
        var response = await useCase.Execute();

        return Ok(response);
    }
}
