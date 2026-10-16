using Microsoft.EntityFrameworkCore;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories.Teams;

namespace Trilho.Infrastructure.DataAcess.Repositories;
internal class TeamRepository : ITeamWriteOnlyRepository, ITeamUpdateOnlyRepository, ITeamReadOnlyRepository
{
    private readonly TrilhoDbContext _dbContext;

    public TeamRepository(TrilhoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Create(Team team)
    {
        await _dbContext.Teams.AddAsync(team);
    }

    public async Task<bool> Delete(long id)
    {
        var team = await _dbContext.Teams.FirstOrDefaultAsync(t => t.Id == id);

        if (team is null)
        {
            return false;
        }

        _dbContext.Teams.Remove(team);

        return true;
    }

    public async Task<List<Team>> GetAll(long? memberUserId = null, bool includeArchived = false)
    {
        var query = WithRelations(_dbContext.Teams.AsNoTracking());

        if (includeArchived == false)
        {
            query = query.Where(team => team.IsArchived == false);
        }

        if (memberUserId is not null)
        {
            query = query.Where(team => team.LeaderId == memberUserId || team.Members.Any(member => member.UserId == memberUserId));
        }

        return await query.OrderBy(team => team.Name).ToListAsync();
    }

    async Task<Team?> ITeamReadOnlyRepository.GetById(long id)
    {
        return await WithRelations(_dbContext.Teams.AsNoTracking()).FirstOrDefaultAsync(team => team.Id == id);
    }

    async Task<Team?> ITeamUpdateOnlyRepository.GetById(long id)
    {
        return await WithRelations(_dbContext.Teams).FirstOrDefaultAsync(team => team.Id == id);
    }

    public void Update(Team team)
    {
        _dbContext.Teams.Update(team);
    }

    public async Task<bool> ExistsTeamWithName(string name, long? ignoreTeamId = null)
    {
        return await _dbContext.Teams.AnyAsync(team => team.Name == name && (ignoreTeamId == null || team.Id != ignoreTeamId));
    }

    public async Task<bool> ExistsTeamLedBy(long userId, long? ignoreTeamId = null, bool onlyActive = true)
    {
        return await _dbContext.Teams.AnyAsync(team =>
            team.LeaderId == userId
            && (ignoreTeamId == null || team.Id != ignoreTeamId)
            && (onlyActive == false || team.IsArchived == false));
    }

    private static IQueryable<Team> WithRelations(IQueryable<Team> query)
    {
        return query
            .Include(team => team.Leader)
            .Include(team => team.Members)
            .ThenInclude(member => member.User);
    }
}
