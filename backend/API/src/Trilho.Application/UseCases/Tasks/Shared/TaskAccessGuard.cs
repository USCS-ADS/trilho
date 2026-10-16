using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories.Teams;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Tasks.Shared;
public class TaskAccessGuard : ITaskAccessGuard
{
    private readonly ITeamReadOnlyRepository _teamRepository;

    public TaskAccessGuard(ITeamReadOnlyRepository teamRepository)
    {
        _teamRepository = teamRepository;
    }

    public async Task<Team> GetTeamForMember(User user, long teamId)
    {
        var team = await GetTeam(teamId);

        var isMember = user.Role == Roles.ADMIN || team.LeaderId == user.Id || team.HasMember(user.Id);

        if (isMember == false)
        {
            throw new ForbiddenException(ResourceErrorsMessage.FORBIDDEN_ACTION);
        }

        return team;
    }

    public async Task<Team> GetTeamForManager(User user, long teamId)
    {
        var team = await GetTeam(teamId);

        if (team.CanBeManagedBy(user) == false)
        {
            throw new ForbiddenException(ResourceErrorsMessage.FORBIDDEN_ACTION);
        }

        return team;
    }

    public async Task<IReadOnlyCollection<long>?> ResolveVisibleTeamIds(User user, long? teamId)
    {
        if (teamId is not null)
        {
            await GetTeamForMember(user, teamId.Value);

            return [teamId.Value];
        }

        if (user.Role == Roles.ADMIN)
        {
            return null;
        }

        var teams = await _teamRepository.GetAll(user.Id);

        return teams.Select(team => team.Id).ToList();
    }

    public void EnsureAssigneeBelongsToTeam(Team team, long? assigneeId)
    {
        if (assigneeId is not null && team.HasMember(assigneeId.Value) == false)
        {
            throw new ErrorOnValidationException([ResourceErrorsMessage.TASK_ASSIGNEE_NOT_TEAM_MEMBER]);
        }
    }

    private async Task<Team> GetTeam(long teamId)
    {
        var team = await _teamRepository.GetById(teamId);

        return team ?? throw new NotFoundException(ResourceErrorsMessage.TEAM_NOT_FOUND);
    }
}
