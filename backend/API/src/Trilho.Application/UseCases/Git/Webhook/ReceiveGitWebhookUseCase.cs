using System.Text;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Git;
using Trilho.Domain.Security.Cryptography;
using Trilho.Domain.Services.Git;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Git.Webhook;
public class ReceiveGitWebhookUseCase : IReceiveGitWebhookUseCase
{
    private readonly IGitRepositoryReadOnlyRepository _repositoryRepository;
    private readonly IPendingGitEventWriteOnlyRepository _eventRepository;
    private readonly IEnumerable<IGitProvider> _providers;
    private readonly ISecretProtector _secretProtector;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public ReceiveGitWebhookUseCase(
        IGitRepositoryReadOnlyRepository repositoryRepository,
        IPendingGitEventWriteOnlyRepository eventRepository,
        IEnumerable<IGitProvider> providers,
        ISecretProtector secretProtector,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        _repositoryRepository = repositoryRepository;
        _eventRepository = eventRepository;
        _providers = providers;
        _secretProtector = secretProtector;
        _unitOfWork = unitOfWork;
        _timeProvider = timeProvider;
    }

    public async Task<GitWebhookReceipt> Execute(long repositoryId, IReadOnlyDictionary<string, string> headers, byte[] body)
    {
        var repository = await _repositoryRepository.GetById(repositoryId)
            ?? throw new NotFoundException(ResourceErrorsMessage.GIT_REPOSITORY_NOT_FOUND);

        var provider = _providers.First(candidate => candidate.Name == repository.Provider);

        // Assinatura primeiro: nada é gravado nem interpretado sem prova de origem.
        var secret = _secretProtector.Unprotect(repository.WebhookSecretProtected);

        if (provider.IsSignatureValid(secret, headers, body) == false)
        {
            throw new UnauthorizedException(ResourceErrorsMessage.GIT_WEBHOOK_SIGNATURE_INVALID);
        }

        var eventType = provider.ExtractEventType(headers);

        if (string.IsNullOrWhiteSpace(eventType))
        {
            return new GitWebhookReceipt(null);
        }

        var payload = Encoding.UTF8.GetString(body);

        // Eventos que o Trilho não usa (ping, tags...) são confirmados sem entrar na fila.
        GitEvent? parsed;

        try
        {
            parsed = provider.Parse(eventType, payload);
        }
        catch (System.Text.Json.JsonException)
        {
            throw new ErrorOnValidationException([ResourceErrorsMessage.GIT_WEBHOOK_PAYLOAD_INVALID]);
        }

        if (parsed is null)
        {
            return new GitWebhookReceipt(null);
        }

        var gitEvent = new PendingGitEvent
        {
            RepositoryId = repository.Id,
            EventType = eventType,
            Payload = payload,
            ReceivedAt = _timeProvider.GetUtcNow().UtcDateTime
        };

        await _eventRepository.Create(gitEvent);
        await _unitOfWork.Commit();

        return new GitWebhookReceipt(gitEvent.Id);
    }
}
