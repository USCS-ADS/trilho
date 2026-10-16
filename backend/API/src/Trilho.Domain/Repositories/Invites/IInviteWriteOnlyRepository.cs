using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Invites;
public interface IInviteWriteOnlyRepository
{
    Task Create(Invite invite);
}
