using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Teams;
public interface ITeamReadOnlyRepository
{
    /// <param name="memberUserId">Quando informado, retorna apenas os times de que o usuário participa.</param>
    Task<List<Team>> GetAll(long? memberUserId = null, bool includeArchived = false);

    /// <summary>Time com líder e membros carregados (sem tracking).</summary>
    Task<Team?> GetById(long id);

    Task<bool> ExistsTeamWithName(string name, long? ignoreTeamId = null);

    /// <param name="onlyActive">
    /// true: considera só times ativos (regra "líder de um time por vez");
    /// false: inclui arquivados (o vínculo ainda impede excluir o usuário).
    /// </param>
    Task<bool> ExistsTeamLedBy(long userId, long? ignoreTeamId = null, bool onlyActive = true);
}
