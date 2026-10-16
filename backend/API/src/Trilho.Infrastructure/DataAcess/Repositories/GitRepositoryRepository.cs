using Microsoft.EntityFrameworkCore;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories.Git;

namespace Trilho.Infrastructure.DataAcess.Repositories;
internal class GitRepositoryRepository : IGitRepositoryWriteOnlyRepository, IGitRepositoryUpdateOnlyRepository, IGitRepositoryReadOnlyRepository
{
    private readonly TrilhoDbContext _dbContext;

    public GitRepositoryRepository(TrilhoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Create(GitRepository repository)
    {
        await _dbContext.GitRepositories.AddAsync(repository);
    }

    public async Task<bool> Delete(long id)
    {
        var repository = await _dbContext.GitRepositories.FirstOrDefaultAsync(r => r.Id == id);

        if (repository is null)
        {
            return false;
        }

        _dbContext.GitRepositories.Remove(repository);

        return true;
    }

    public async Task<List<GitRepository>> GetAll(IReadOnlyCollection<long>? teamIds)
    {
        var query = _dbContext.GitRepositories.AsNoTracking().AsQueryable();

        if (teamIds is not null)
        {
            var ids = teamIds.ToList();
            query = query.Where(repository => ids.Contains(repository.TeamId));
        }

        return await query.OrderBy(repository => repository.FullName).ToListAsync();
    }

    async Task<GitRepository?> IGitRepositoryReadOnlyRepository.GetById(long id)
    {
        return await _dbContext.GitRepositories.AsNoTracking().FirstOrDefaultAsync(repository => repository.Id == id);
    }

    async Task<GitRepository?> IGitRepositoryUpdateOnlyRepository.GetById(long id)
    {
        return await _dbContext.GitRepositories.FirstOrDefaultAsync(repository => repository.Id == id);
    }

    public async Task<bool> Exists(string provider, string fullName)
    {
        return await _dbContext.GitRepositories.AnyAsync(repository => repository.Provider == provider && repository.FullName == fullName);
    }

    public async Task<Dictionary<long, int>> CountPendingEvents(IReadOnlyCollection<long> repositoryIds)
    {
        var ids = repositoryIds.ToList();

        var rows = await _dbContext.PendingGitEvents.AsNoTracking()
            .Where(gitEvent => gitEvent.ProcessedAt == null && ids.Contains(gitEvent.RepositoryId))
            .GroupBy(gitEvent => gitEvent.RepositoryId)
            .Select(group => new { RepositoryId = group.Key, Count = group.Count() })
            .ToListAsync();

        return rows.ToDictionary(row => row.RepositoryId, row => row.Count);
    }

    public void Update(GitRepository repository)
    {
        _dbContext.GitRepositories.Update(repository);
    }
}
