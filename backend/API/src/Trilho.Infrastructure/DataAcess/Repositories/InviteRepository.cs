using Microsoft.EntityFrameworkCore;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories.Invites;

namespace Trilho.Infrastructure.DataAcess.Repositories;
internal class InviteRepository : IInviteWriteOnlyRepository, IInviteUpdateOnlyRepository, IInviteReadOnlyRepository
{
    private readonly TrilhoDbContext _dbContext;

    public InviteRepository(TrilhoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Create(Invite invite)
    {
        await _dbContext.Invites.AddAsync(invite);
    }

    public async Task<List<Invite>> GetPending(IReadOnlyCollection<long>? teamIds, DateTime now)
    {
        var query = _dbContext.Invites.AsNoTracking()
            .Include(invite => invite.Team)
            .Where(invite => invite.AcceptedAt == null && invite.CancelledAt == null && invite.ExpiresAt > now);

        if (teamIds is not null)
        {
            var ids = teamIds.ToList();
            query = query.Where(invite => ids.Contains(invite.TeamId));
        }

        return await query.OrderByDescending(invite => invite.CreatedAt).ToListAsync();
    }

    async Task<Invite?> IInviteReadOnlyRepository.GetPendingByTokenHash(string tokenHash, DateTime now)
    {
        return await _dbContext.Invites.AsNoTracking()
            .Include(invite => invite.Team)
            .FirstOrDefaultAsync(invite => invite.TokenHash == tokenHash
                && invite.AcceptedAt == null && invite.CancelledAt == null && invite.ExpiresAt > now);
    }

    async Task<Invite?> IInviteUpdateOnlyRepository.GetPendingByTokenHash(string tokenHash, DateTime now)
    {
        return await _dbContext.Invites
            .FirstOrDefaultAsync(invite => invite.TokenHash == tokenHash
                && invite.AcceptedAt == null && invite.CancelledAt == null && invite.ExpiresAt > now);
    }

    public async Task<Invite?> GetById(long id)
    {
        return await _dbContext.Invites.FirstOrDefaultAsync(invite => invite.Id == id);
    }

    public async Task<List<Invite>> GetPendingByEmailAndTeam(string email, long teamId, DateTime now)
    {
        return await _dbContext.Invites
            .Where(invite => invite.Email == email && invite.TeamId == teamId
                && invite.AcceptedAt == null && invite.CancelledAt == null && invite.ExpiresAt > now)
            .ToListAsync();
    }

    public void Update(Invite invite)
    {
        _dbContext.Invites.Update(invite);
    }
}
