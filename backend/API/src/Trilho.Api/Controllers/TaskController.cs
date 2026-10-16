using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trilho.Application.UseCases.Comments.Create;
using Trilho.Application.UseCases.Comments.Delete;
using Trilho.Application.UseCases.Subtasks.Create;
using Trilho.Application.UseCases.Subtasks.Delete;
using Trilho.Application.UseCases.Subtasks.Update;
using Trilho.Application.UseCases.Tasks.Create;
using Trilho.Application.UseCases.Tasks.Delete;
using Trilho.Application.UseCases.Tasks.GetActivity;
using Trilho.Application.UseCases.Tasks.GetBoard;
using Trilho.Application.UseCases.Tasks.GetById;
using Trilho.Application.UseCases.Tasks.Move;
using Trilho.Application.UseCases.Tasks.Update;
using Trilho.Communication.Requests.Tasks;
using Trilho.Communication.Responses;
using Trilho.Communication.Responses.Tasks;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TaskController : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ResponseTaskJson), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromServices] ICreateTaskUseCase useCase, [FromBody] RequestTaskJson request)
    {
        var response = await useCase.Execute(request);

        return Created(string.Empty, response);
    }

    /// <summary>Quadro Kanban. Sem <c>teamId</c>: todos os times do usuário (administrador: todos).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ResponseTaskSummaryJson>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetBoard(
        [FromServices] IGetBoardTaskUseCase useCase,
        [FromQuery] long? teamId,
        [FromQuery] long? assigneeId,
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        var response = await useCase.Execute(teamId, assigneeId, status, priority, page, pageSize);

        Response.Headers["X-Total-Count"] = response.TotalCount.ToString();
        Response.Headers["X-Page"] = response.Page.ToString();
        Response.Headers["X-Page-Size"] = response.PageSize.ToString();

        if (response.Tasks.Count != 0)
        {
            return Ok(response.Tasks);
        }

        return NoContent();
    }

    [HttpGet]
    [Route("{id}")]
    [ProducesResponseType(typeof(ResponseTaskJson), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromServices] IGetByIdTaskUseCase useCase, [FromRoute] long id)
    {
        var response = await useCase.Execute(id);

        return Ok(response);
    }

    [HttpPut]
    [Route("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update([FromServices] IUpdateTaskUseCase useCase, [FromRoute] long id, [FromBody] RequestUpdateTaskJson request)
    {
        await useCase.Execute(id, request);

        return NoContent();
    }

    /// <summary>Move a tarefa de coluna/posição (arrastar e soltar do Kanban).</summary>
    [HttpPut]
    [Route("{id}/move")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Move([FromServices] IMoveTaskUseCase useCase, [FromRoute] long id, [FromBody] RequestMoveTaskJson request)
    {
        await useCase.Execute(id, request);

        return NoContent();
    }

    [HttpDelete]
    [Route("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete([FromServices] IDeleteTaskUseCase useCase, [FromRoute] long id)
    {
        await useCase.Execute(id);

        return NoContent();
    }

    [HttpGet]
    [Route("{id}/activity")]
    [ProducesResponseType(typeof(List<ResponseActivityJson>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetActivity([FromServices] IGetTaskActivityUseCase useCase, [FromRoute] long id)
    {
        var response = await useCase.Execute(id);

        return Ok(response);
    }

    // ---- Subtarefas

    [HttpPost]
    [Route("{id}/subtask")]
    [ProducesResponseType(typeof(ResponseSubtaskJson), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateSubtask([FromServices] ICreateSubtaskUseCase useCase, [FromRoute] long id, [FromBody] RequestSubtaskJson request)
    {
        var response = await useCase.Execute(id, request);

        return Created(string.Empty, response);
    }

    [HttpPut]
    [Route("{id}/subtask/{subtaskId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateSubtask([FromServices] IUpdateSubtaskUseCase useCase, [FromRoute] long id, [FromRoute] long subtaskId, [FromBody] RequestUpdateSubtaskJson request)
    {
        await useCase.Execute(id, subtaskId, request);

        return NoContent();
    }

    [HttpDelete]
    [Route("{id}/subtask/{subtaskId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteSubtask([FromServices] IDeleteSubtaskUseCase useCase, [FromRoute] long id, [FromRoute] long subtaskId)
    {
        await useCase.Execute(id, subtaskId);

        return NoContent();
    }

    // ---- Comentários

    [HttpPost]
    [Route("{id}/comment")]
    [ProducesResponseType(typeof(ResponseCommentJson), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateComment([FromServices] ICreateCommentUseCase useCase, [FromRoute] long id, [FromBody] RequestCommentJson request)
    {
        var response = await useCase.Execute(id, request);

        return Created(string.Empty, response);
    }

    [HttpDelete]
    [Route("{id}/comment/{commentId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteComment([FromServices] IDeleteCommentUseCase useCase, [FromRoute] long id, [FromRoute] long commentId)
    {
        await useCase.Execute(id, commentId);

        return NoContent();
    }
}
