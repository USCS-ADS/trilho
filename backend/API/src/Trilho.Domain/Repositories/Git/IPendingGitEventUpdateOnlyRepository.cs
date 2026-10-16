using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Git;
public interface IPendingGitEventUpdateOnlyRepository
{
    Task<PendingGitEvent?> GetById(long id);

    /// <summary>Ids dos eventos não processados que ainda não esgotaram as tentativas, do mais antigo ao mais novo.</summary>
    Task<List<long>> GetPendingIds(long? repositoryId, int maxAttempts);

    void Update(PendingGitEvent gitEvent);
}
