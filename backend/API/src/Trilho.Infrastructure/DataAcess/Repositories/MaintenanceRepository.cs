using Microsoft.EntityFrameworkCore;
using Trilho.Domain.Repositories.Maintenance;

namespace Trilho.Infrastructure.DataAcess.Repositories;
internal class MaintenanceRepository : IMaintenanceRepository
{
    private readonly TrilhoDbContext _dbContext;

    public MaintenanceRepository(TrilhoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<int> PurgeProcessedGitEvents(DateTime olderThan, int batchSize)
    {
        var events = await _dbContext.PendingGitEvents
            .Where(gitEvent => gitEvent.ProcessedAt != null && gitEvent.ProcessedAt < olderThan)
            .OrderBy(gitEvent => gitEvent.Id)
            .Take(batchSize)
            .ToListAsync();

        _dbContext.PendingGitEvents.RemoveRange(events);

        return events.Count;
    }

    public async Task<int> PurgeClosedPasswordResets(DateTime olderThan, int batchSize)
    {
        var requests = await _dbContext.PasswordResetRequests
            .Where(request => (request.UsedAt != null && request.UsedAt < olderThan) || request.ExpiresAt < olderThan)
            .OrderBy(request => request.Id)
            .Take(batchSize)
            .ToListAsync();

        _dbContext.PasswordResetRequests.RemoveRange(requests);

        return requests.Count;
    }

    public async Task<int> PurgeClosedInvites(DateTime olderThan, int batchSize)
    {
        var invites = await _dbContext.Invites
            .Where(invite => invite.AcceptedAt < olderThan || invite.CancelledAt < olderThan
                || (invite.AcceptedAt == null && invite.CancelledAt == null && invite.ExpiresAt < olderThan))
            .OrderBy(invite => invite.Id)
            .Take(batchSize)
            .ToListAsync();

        _dbContext.Invites.RemoveRange(invites);

        return invites.Count;
    }
}
