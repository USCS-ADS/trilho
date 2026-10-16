using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Git;
public interface IPendingGitEventWriteOnlyRepository
{
    Task Create(PendingGitEvent gitEvent);
}
