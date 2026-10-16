using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trilho.Api.Authorization;
using Trilho.Application.UseCases.Teams.AddMember;
using Trilho.Application.UseCases.Teams.Archive;
using Trilho.Application.UseCases.Teams.ChangeLeader;
using Trilho.Application.UseCases.Teams.Create;
using Trilho.Application.UseCases.Teams.Delete;
using Trilho.Application.UseCases.Teams.GetAll;
using Trilho.Application.UseCases.Teams.GetById;
using Trilho.Application.UseCases.Teams.RemoveMember;
using Trilho.Application.UseCases.Teams.Restore;
using Trilho.Application.UseCases.Teams.Update;
using Trilho.Communication.Requests.Teams;
using Trilho.Communication.Responses;
using Trilho.Communication.Responses.Teams;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TeamController : ControllerBase
{
    [HttpPost]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(typeof(ResponseTeamJson), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromServices] ICreateTeamUseCase useCase, [FromBody] RequestTeamJson request)
    {
        var response = await useCase.Execute(request);

        return Created(string.Empty, response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<ResponseTeamJson>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> GetAll([FromServices] IGetAllTeamUseCase useCase, [FromQuery] bool includeArchived = false)
    {
        var response = await useCase.Execute(includeArchived);

        if (response.Teams.Count != 0)
        {
            return Ok(response.Teams);
        }

        return NoContent();
    }

    [HttpGet]
    [Route("{id}")]
    [ProducesResponseType(typeof(ResponseTeamJson), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromServices] IGetByIdTeamUseCase useCase, [FromRoute] long id)
    {
        var response = await useCase.Execute(id);

        return Ok(response);
    }

    [HttpPut]
    [Route("{id}")]
    [Authorize(Policy = Policies.LeaderOrAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update([FromServices] IUpdateTeamUseCase useCase, [FromRoute] long id, [FromBody] RequestUpdateTeamJson request)
    {
        await useCase.Execute(id, request);

        return NoContent();
    }

    [HttpPut]
    [Route("{id}/leader")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> ChangeLeader([FromServices] IChangeTeamLeaderUseCase useCase, [FromRoute] long id, [FromBody] RequestChangeLeaderJson request)
    {
        await useCase.Execute(id, request);

        return NoContent();
    }

    [HttpPost]
    [Route("{id}/member")]
    [Authorize(Policy = Policies.LeaderOrAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AddMember([FromServices] IAddTeamMemberUseCase useCase, [FromRoute] long id, [FromBody] RequestTeamMemberJson request)
    {
        await useCase.Execute(id, request);

        return NoContent();
    }

    [HttpDelete]
    [Route("{id}/member/{userId}")]
    [Authorize(Policy = Policies.LeaderOrAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RemoveMember([FromServices] IRemoveTeamMemberUseCase useCase, [FromRoute] long id, [FromRoute] long userId)
    {
        await useCase.Execute(id, userId);

        return NoContent();
    }

    [HttpPost]
    [Route("{id}/archive")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Archive([FromServices] IArchiveTeamUseCase useCase, [FromRoute] long id)
    {
        await useCase.Execute(id);

        return NoContent();
    }

    [HttpPost]
    [Route("{id}/restore")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Restore([FromServices] IRestoreTeamUseCase useCase, [FromRoute] long id)
    {
        await useCase.Execute(id);

        return NoContent();
    }

    [HttpDelete]
    [Route("{id}")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromServices] IDeleteTeamUseCase useCase, [FromRoute] long id)
    {
        await useCase.Execute(id);

        return NoContent();
    }
}
