using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Repositories.Users;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Teams.Shared;
public class TeamLeaderGuard : ITeamLeaderGuard
{
    private readonly IUserReadOnlyRepository _userRepository;
    private readonly ITeamReadOnlyRepository _teamRepository;

    public TeamLeaderGuard(IUserReadOnlyRepository userRepository, ITeamReadOnlyRepository teamRepository)
    {
        _userRepository = userRepository;
        _teamRepository = teamRepository;
    }

    public async Task<User> EnsureCanLead(long userId, long? ignoreTeamId = null)
    {
        var user = await _userRepository.GetById(userId);

        if (user is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.USER_NOT_FOUND);
        }

        if (user.IsActive == false)
        {
            throw new ErrorOnValidationException([ResourceErrorsMessage.USER_NOT_ACTIVE]);
        }

        if (user.Role != Roles.LEADER && user.Role != Roles.ADMIN)
        {
            throw new ErrorOnValidationException([ResourceErrorsMessage.TEAM_LEADER_INVALID_ROLE]);
        }

        if (await _teamRepository.ExistsTeamLedBy(user.Id, ignoreTeamId))
        {
            throw new ConflictException(ResourceErrorsMessage.USER_ALREADY_LEADS_TEAM);
        }

        return user;
    }
}
