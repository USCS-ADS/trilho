using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Invites;
public interface IInviteUpdateOnlyRepository
{
    Task<Invite?> GetById(long id);
    Task<Invite?> GetPendingByTokenHash(string tokenHash, DateTime now);
    Task<List<Invite>> GetPendingByEmailAndTeam(string email, long teamId, DateTime now);
    void Update(Invite invite);
}
