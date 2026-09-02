using Trilho.Domain.Repositories;

namespace Trilho.Infrastructure.DataAcess;
internal class UnitOfWork : IUnitOfWork
{
    private readonly TrilhoDbContext _dbContext;
    public UnitOfWork(TrilhoDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    public async Task Commit()
    {
        await _dbContext.SaveChangesAsync();
    }
}
