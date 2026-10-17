using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trilho.Api.Authorization;
using Trilho.Application.UseCases.Users.ChangePassword;
using Trilho.Application.UseCases.Users.Create;
using Trilho.Application.UseCases.Users.Delete;
using Trilho.Application.UseCases.Users.GetAll;
using Trilho.Application.UseCases.Users.GetById;
using Trilho.Application.UseCases.Users.SetStatus;
using Trilho.Application.UseCases.Users.Update;
using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses;
using Trilho.Communication.Responses.Users;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserController : ControllerBase
{
    [HttpPost]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(typeof(ResponseUserJson), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]

    public async Task<IActionResult> Create([FromServices] ICreateUserUseCase useCase, [FromBody] RequestUserJson request)
    {
        var response = await useCase.Execute(request);

        return Created(string.Empty, response);
    }

    [HttpGet]
    [Authorize(Policy = Policies.LeaderOrAdmin)]
    [ProducesResponseType(typeof(ResponseUserListJson), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> GetAll([FromServices] IGetAllUserUseCase useCase, [FromQuery] int? page, [FromQuery] int? pageSize)
    {
        var response = await useCase.Execute(page, pageSize);

        Response.Headers["X-Total-Count"] = response.TotalCount.ToString();
        Response.Headers["X-Page"] = response.Page.ToString();
        Response.Headers["X-Page-Size"] = response.PageSize.ToString();

        if (response.Users.Count != 0)
        {
            return Ok(response.Users);
        }

        return NoContent();
    }

    [HttpPut]
    [Route("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]

    public async Task<IActionResult> Update([FromServices] IUpdateUserUseCase useCase, [FromRoute] long id, [FromBody] RequestUserJson request)
    {
        await useCase.Execute(id, request);

        return NoContent();
    }

    /// <summary>Troca a própria senha (exige a senha atual).</summary>
    [HttpPut]
    [Route("change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword([FromServices] IChangePasswordUseCase useCase, [FromBody] RequestChangePasswordJson request)
    {
        await useCase.Execute(request);

        return NoContent();
    }

    /// <summary>Ativa ou desativa um usuário (desativado não entra no sistema).</summary>
    [HttpPut]
    [Route("{id}/status")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SetStatus([FromServices] ISetUserStatusUseCase useCase, [FromRoute] long id, [FromBody] RequestUserStatusJson request)
    {
        await useCase.Execute(id, request);

        return NoContent();
    }

    [HttpGet]
    [Route("{id}")]
    [ProducesResponseType(typeof(ResponseUserJson), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]

    public async Task<IActionResult> GetById([FromServices] IGetByIdUserUseCase useCase, [FromRoute] long id)
    {
        var response = await useCase.Execute(id);

        return Ok(response);
    }

    [HttpDelete]
    [Route("{id}")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]

    public async Task<IActionResult> Delete([FromServices] IDeleteUserUseCase useCase, [FromRoute] long id)
    {
        await useCase.Execute(id);

        return NoContent();
    }


}
