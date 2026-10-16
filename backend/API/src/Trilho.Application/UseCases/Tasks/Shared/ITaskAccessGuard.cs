using Trilho.Domain.Entities;

namespace Trilho.Application.UseCases.Tasks.Shared;
public interface ITaskAccessGuard
{
    /// <summary>Time do qual o usuário (ou o administrador) pode ver/alterar tarefas; 404/403 caso contrário.</summary>
    Task<Team> GetTeamForMember(User user, long teamId);

    /// <summary>Time que o usuário gerencia (administrador ou líder do time); 404/403 caso contrário.</summary>
    Task<Team> GetTeamForManager(User user, long teamId);

    /// <summary>
    /// Times cujas tarefas o usuário enxerga: o informado (exige participação), todos (administrador, nulo)
    /// ou apenas os times de que participa.
    /// </summary>
    Task<IReadOnlyCollection<long>?> ResolveVisibleTeamIds(User user, long? teamId);

    /// <summary>O responsável precisa ser membro do time da tarefa.</summary>
    void EnsureAssigneeBelongsToTeam(Team team, long? assigneeId);
}
