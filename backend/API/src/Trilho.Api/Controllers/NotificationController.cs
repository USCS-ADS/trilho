using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trilho.Application.UseCases.Notifications.GetMine;
using Trilho.Application.UseCases.Notifications.MarkAllAsRead;
using Trilho.Application.UseCases.Notifications.MarkAsRead;
using Trilho.Communication.Responses;
using Trilho.Communication.Responses.Notifications;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class NotificationController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ResponseNotificationListJson), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine([FromServices] IGetMyNotificationsUseCase useCase, [FromQuery] bool unreadOnly = false, [FromQuery] int limit = 50)
    {
        var response = await useCase.Execute(unreadOnly, limit);

        return Ok(response);
    }

    [HttpPut]
    [Route("{id}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead([FromServices] IMarkNotificationAsReadUseCase useCase, [FromRoute] long id)
    {
        await useCase.Execute(id);

        return NoContent();
    }

    [HttpPut]
    [Route("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllAsRead([FromServices] IMarkAllNotificationsAsReadUseCase useCase)
    {
        await useCase.Execute();

        return NoContent();
    }
}
