using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Git;
public interface IGitRepositoryReadOnlyRepository
{
    /// <param name="teamIds">Nulo = todos os times.</param>
    Task<List<GitRepository>> GetAll(IReadOnlyCollection<long>? teamIds);
    Task<GitRepository?> GetById(long id);
    Task<bool> Exists(string provider, string fullName);

    /// <summary>Eventos ainda não processados, por repositório.</summary>
    Task<Dictionary<long, int>> CountPendingEvents(IReadOnlyCollection<long> repositoryIds);
}
