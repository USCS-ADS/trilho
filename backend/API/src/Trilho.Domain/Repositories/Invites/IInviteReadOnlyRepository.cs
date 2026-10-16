using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Invites;
public interface IInviteReadOnlyRepository
{
    /// <param name="teamIds">Nulo = todos os times (administrador).</param>
    Task<List<Invite>> GetPending(IReadOnlyCollection<long>? teamIds, DateTime now);

    /// <summary>Convite pendente (com time) para o hash do token, ou nulo.</summary>
    Task<Invite?> GetPendingByTokenHash(string tokenHash, DateTime now);
}
