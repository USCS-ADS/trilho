using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Teams;
public interface ITeamUpdateOnlyRepository
{
    /// <summary>Time com líder e membros carregados, rastreado para alteração.</summary>
    Task<Team?> GetById(long id);
    void Update(Team team);
}
