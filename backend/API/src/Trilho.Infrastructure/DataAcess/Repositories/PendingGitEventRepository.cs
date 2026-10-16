using Microsoft.EntityFrameworkCore;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories.Git;

namespace Trilho.Infrastructure.DataAcess.Repositories;
internal class PendingGitEventRepository : IPendingGitEventWriteOnlyRepository, IPendingGitEventUpdateOnlyRepository
{
    private readonly TrilhoDbContext _dbContext;

    public PendingGitEventRepository(TrilhoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Create(PendingGitEvent gitEvent)
    {
        await _dbContext.PendingGitEvents.AddAsync(gitEvent);
    }

    public async Task<PendingGitEvent?> GetById(long id)
    {
        return await _dbContext.PendingGitEvents.FirstOrDefaultAsync(gitEvent => gitEvent.Id == id);
    }

    public async Task<List<long>> GetPendingIds(long? repositoryId, int maxAttempts)
    {
        var query = _dbContext.PendingGitEvents.AsNoTracking()
            .Where(gitEvent => gitEvent.ProcessedAt == null && gitEvent.Attempts < maxAttempts);

        if (repositoryId is not null)
        {
            query = query.Where(gitEvent => gitEvent.RepositoryId == repositoryId);
        }

        return await query.OrderBy(gitEvent => gitEvent.ReceivedAt).ThenBy(gitEvent => gitEvent.Id).Select(gitEvent => gitEvent.Id).ToListAsync();
    }

    public void Update(PendingGitEvent gitEvent)
    {
        _dbContext.PendingGitEvents.Update(gitEvent);
    }
}
