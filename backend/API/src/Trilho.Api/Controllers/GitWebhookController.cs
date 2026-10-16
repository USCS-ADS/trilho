using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Trilho.Api.Extensions;
using Trilho.Application.UseCases.Git.Shared;
using Trilho.Application.UseCases.Git.Webhook;
using Trilho.Communication.Responses;

namespace Trilho.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
[AllowAnonymous]
public class GitWebhookController : ControllerBase
{
    /// <summary>
    /// Endpoint chamado pelo GitHub/GitLab. Anônimo, mas protegido por assinatura HMAC
    /// (X-Hub-Signature-256) ou token (X-Gitlab-Token) do repositório. Sempre confirma com 202 após gravar o
    /// evento; falhas no processamento ficam na fila e são reprocessadas.
    /// </summary>
    [HttpPost]
    [Route("{repositoryId}")]
    [RequestSizeLimit(1_048_576)]
    [EnableRateLimiting(RateLimitingExtension.WebhookPolicy)]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ResponseErrorJson), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Receive(
        [FromServices] IReceiveGitWebhookUseCase useCase,
        [FromServices] IGitEventRunner runner,
        [FromRoute] long repositoryId)
    {
        using var buffer = new MemoryStream();
        await Request.Body.CopyToAsync(buffer);

        var headers = Request.Headers.ToDictionary(
            header => header.Key,
            header => header.Value.ToString(),
            StringComparer.OrdinalIgnoreCase);

        var receipt = await useCase.Execute(repositoryId, headers, buffer.ToArray());

        if (receipt.PendingEventId is null)
        {
            return NoContent();
        }

        // Processa já; se falhar, o evento permanece na fila para o job/"sincronizar agora".
        await runner.Run(receipt.PendingEventId.Value);

        return Accepted();
    }
}
