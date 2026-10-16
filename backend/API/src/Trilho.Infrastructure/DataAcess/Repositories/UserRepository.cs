using Trilho.Domain.Entities;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Users;
using Microsoft.EntityFrameworkCore;

namespace Trilho.Infrastructure.DataAcess.Repositories;
internal class UserRepository : IUserWriteOnlyRepository, IUserUpdateOnlyRepository, IUserReadOnlyRepository
{
    private readonly TrilhoDbContext _dbContext;

    public UserRepository(TrilhoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Create(User user)
    {
        await _dbContext.Users.AddAsync(user);
    }

    public async Task<bool> Delete(long id)
    {
        var result = await _dbContext.Users.FirstOrDefaultAsync(users => users.Id == id);

        if(result is null)
        {
            return false;
        }

        _dbContext.Users.Remove(result);

        return true;
    }

    public async Task<bool> ExistsUserWithEmail(string email, long? ignoreUserId = null)
    {
        return await _dbContext.Users.AnyAsync(user => user.Email.Equals(email) && (ignoreUserId == null || user.Id != ignoreUserId));
    }

    public async Task<List<User>> GetAll()
    {
        return await _dbContext.Users.AsNoTracking().ToListAsync();
    }

    public async Task<PagedResult<User>> GetPage(int page, int pageSize)
    {
        var query = _dbContext.Users.AsNoTracking();

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(user => user.Name).ThenBy(user => user.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<User>(items, total);
    }

    async Task<User?> IUserUpdateOnlyRepository.GetById(long id)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(user => user.Id == id);
    }

    async Task<User?> IUserReadOnlyRepository.GetById(long id)
    {
        return await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(user => user.Id == id);
    }

    public void Update(User user)
    {
        _dbContext.Users.Update(user);
    }

    public async Task<User?> GetUserByEmail(string email)
    {
        return await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(user => user.Email.Equals(email));
    }
}
