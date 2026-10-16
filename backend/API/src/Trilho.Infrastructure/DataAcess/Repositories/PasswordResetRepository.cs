using Microsoft.EntityFrameworkCore;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories.PasswordReset;

namespace Trilho.Infrastructure.DataAcess.Repositories;
internal class PasswordResetRepository : IPasswordResetWriteOnlyRepository, IPasswordResetUpdateOnlyRepository
{
    private readonly TrilhoDbContext _dbContext;

    public PasswordResetRepository(TrilhoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Create(PasswordResetRequest request)
    {
        await _dbContext.PasswordResetRequests.AddAsync(request);
    }

    public async Task<List<PasswordResetRequest>> GetActiveByUser(long userId, DateTime now)
    {
        return await _dbContext.PasswordResetRequests
            .Where(request => request.UserId == userId && request.UsedAt == null && request.ExpiresAt > now)
            .OrderByDescending(request => request.CreatedAt).ThenByDescending(request => request.Id)
            .ToListAsync();
    }

    public void Update(PasswordResetRequest request)
    {
        _dbContext.PasswordResetRequests.Update(request);
    }
}
