using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Invites;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Invites.Cancel;
public class CancelInviteUseCase : ICancelInviteUseCase
{
    private readonly IInviteUpdateOnlyRepository _repository;
    private readonly ITeamReadOnlyRepository _teamRepository;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public CancelInviteUseCase(
        IInviteUpdateOnlyRepository repository,
        ITeamReadOnlyRepository teamRepository,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        _repository = repository;
        _teamRepository = teamRepository;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
        _timeProvider = timeProvider;
    }

    public async Task Execute(long id)
    {
        var user = await _loggedUser.User();
        var now = _timeProvider.GetUtcNow().UtcDateTime;

        var invite = await _repository.GetById(id);

        if (invite is null || invite.IsPending(now) == false)
        {
            throw new NotFoundException(ResourceErrorsMessage.INVITE_NOT_FOUND);
        }

        var team = await _teamRepository.GetById(invite.TeamId)
            ?? throw new NotFoundException(ResourceErrorsMessage.TEAM_NOT_FOUND);

        if (team.CanBeManagedBy(user) == false)
        {
            throw new ForbiddenException(ResourceErrorsMessage.FORBIDDEN_ACTION);
        }

        invite.CancelledAt = now;

        _repository.Update(invite);

        await _unitOfWork.Commit();
    }
}
