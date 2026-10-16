using Trilho.Application.UseCases.Git.Shared;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Responses.Git;
using Trilho.Domain.Repositories.Git;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Git.Repositories.Retry;
/// <summary>"Sincronizar agora": reprocessa a fila de eventos do repositório (RF06).</summary>
public class RetryRepositoryEventsUseCase : IRetryRepositoryEventsUseCase
{
    private readonly IGitRepositoryReadOnlyRepository _repository;
    private readonly IGitEventRunner _runner;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;

    public RetryRepositoryEventsUseCase(
        IGitRepositoryReadOnlyRepository repository,
        IGitEventRunner runner,
        ITaskAccessGuard guard,
        ILoggedUser loggedUser)
    {
        _repository = repository;
        _runner = runner;
        _guard = guard;
        _loggedUser = loggedUser;
    }

    public async Task<ResponseGitRunJson> Execute(long id)
    {
        var user = await _loggedUser.User();

        var repository = await _repository.GetById(id)
            ?? throw new NotFoundException(ResourceErrorsMessage.GIT_REPOSITORY_NOT_FOUND);

        await _guard.GetTeamForManager(user, repository.TeamId);

        var (processed, failed) = await _runner.RunPending(id);

        return new ResponseGitRunJson { Processed = processed, Failed = failed };
    }
}
