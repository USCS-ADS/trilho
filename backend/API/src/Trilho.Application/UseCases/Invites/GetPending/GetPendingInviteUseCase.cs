using Trilho.Communication.Responses.Invites;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories.Invites;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Services.LoggedUser;

namespace Trilho.Application.UseCases.Invites.GetPending;
public class GetPendingInviteUseCase : IGetPendingInviteUseCase
{
    private readonly IInviteReadOnlyRepository _inviteRepository;
    private readonly ITeamReadOnlyRepository _teamRepository;
    private readonly ILoggedUser _loggedUser;
    private readonly TimeProvider _timeProvider;

    public GetPendingInviteUseCase(
        IInviteReadOnlyRepository inviteRepository,
        ITeamReadOnlyRepository teamRepository,
        ILoggedUser loggedUser,
        TimeProvider timeProvider)
    {
        _inviteRepository = inviteRepository;
        _teamRepository = teamRepository;
        _loggedUser = loggedUser;
        _timeProvider = timeProvider;
    }

    public async Task<List<ResponseInviteJson>> Execute()
    {
        var user = await _loggedUser.User();

        IReadOnlyCollection<long>? teamIds = null;

        // Administrador vê todos; líder vê apenas os convites dos times que lidera.
        if (user.Role != Roles.ADMIN)
        {
            var teams = await _teamRepository.GetAll(user.Id);
            teamIds = teams.Where(team => team.LeaderId == user.Id).Select(team => team.Id).ToList();
        }

        var invites = await _inviteRepository.GetPending(teamIds, _timeProvider.GetUtcNow().UtcDateTime);

        return invites.Select(invite => new ResponseInviteJson
        {
            Id = invite.Id,
            Email = invite.Email,
            FullName = invite.FullName,
            TeamId = invite.TeamId,
            TeamName = invite.Team?.Name ?? string.Empty,
            Role = invite.Role,
            ExpiresAt = invite.ExpiresAt,
            CreatedAt = invite.CreatedAt
        }).ToList();
    }
}
