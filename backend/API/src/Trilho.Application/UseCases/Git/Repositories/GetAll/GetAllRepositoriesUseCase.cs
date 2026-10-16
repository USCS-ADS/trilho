using Trilho.Application.UseCases.Git.Repositories.Shared;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Responses.Git;
using Trilho.Domain.Repositories.Git;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Domain.Services.Settings;

namespace Trilho.Application.UseCases.Git.Repositories.GetAll;
public class GetAllRepositoriesUseCase : IGetAllRepositoriesUseCase
{
    private readonly IGitRepositoryReadOnlyRepository _repository;
    private readonly ITaskAccessGuard _guard;
    private readonly IGitSettings _settings;
    private readonly ILoggedUser _loggedUser;

    public GetAllRepositoriesUseCase(
        IGitRepositoryReadOnlyRepository repository,
        ITaskAccessGuard guard,
        IGitSettings settings,
        ILoggedUser loggedUser)
    {
        _repository = repository;
        _guard = guard;
        _settings = settings;
        _loggedUser = loggedUser;
    }

    public async Task<List<ResponseGitRepositoryJson>> Execute()
    {
        var user = await _loggedUser.User();

        // Administrador: todos; demais: repositórios dos times de que participam.
        var teamIds = await _guard.ResolveVisibleTeamIds(user, null);

        var repositories = await _repository.GetAll(teamIds);
        var pending = await _repository.CountPendingEvents(repositories.Select(r => r.Id).ToList());

        return repositories
            .Select(repository => repository.ToResponse<ResponseGitRepositoryJson>(_settings, pending.GetValueOrDefault(repository.Id)))
            .ToList();
    }
}
