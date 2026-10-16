using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Git;
public interface IGitRepositoryWriteOnlyRepository
{
    Task Create(GitRepository repository);
    Task<bool> Delete(long id);
}
