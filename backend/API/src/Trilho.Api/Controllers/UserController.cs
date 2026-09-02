using Microsoft.AspNetCore.Mvc;
using Trilho.Application.UseCases.Users.Create;
using Trilho.Application.UseCases.Users.Delete;
using Trilho.Application.UseCases.Users.GetAll;
using Trilho.Application.UseCases.Users.GetById;
using Trilho.Application.UseCases.Users.Update;
using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses;
using Trilho.Communication.Responses.Users;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ResponseUserJson), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]

    public async Task<IActionResult> Create([FromServices] ICreateUserUseCase useCase, [FromBody] RequestUserJson request)
    {
        var response = await useCase.Execute(request);

        return Created(string.Empty, response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(ResponseUserListJson), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> GetAll([FromServices] IGetAllUserUseCase useCase)
    {
        var response = await useCase.Execute();

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

    public async Task<IActionResult> Update([FromServices] IUpdateUserUseCase useCase, [FromRoute] long id, [FromBody] RequestUserJson request)
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
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]

    public async Task<IActionResult> Delete([FromServices] IDeleteUserUseCase useCase, [FromRoute] long id)
    {
        await useCase.Execute(id);

        return NoContent();
    }


}
