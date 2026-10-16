using Trilho.Domain.Entities;

namespace Trilho.Application.UseCases.Teams.Shared;
public interface ITeamLeaderGuard
{
    /// <summary>
    /// Garante que o usuário pode liderar um time: existe, está ativo, tem perfil de líder/administrador
    /// e não lidera outro time ativo (RF02). Retorna o usuário validado.
    /// </summary>
    Task<User> EnsureCanLead(long userId, long? ignoreTeamId = null);
}
