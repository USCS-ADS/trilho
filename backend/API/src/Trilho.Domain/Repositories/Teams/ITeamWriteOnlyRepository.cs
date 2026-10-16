using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Teams;
public interface ITeamWriteOnlyRepository
{
    Task Create(Team team);
    Task<bool> Delete(long id);
}
