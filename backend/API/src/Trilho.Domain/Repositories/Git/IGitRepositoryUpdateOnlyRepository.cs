using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Git;
public interface IGitRepositoryUpdateOnlyRepository
{
    Task<GitRepository?> GetById(long id);
    void Update(GitRepository repository);
}
