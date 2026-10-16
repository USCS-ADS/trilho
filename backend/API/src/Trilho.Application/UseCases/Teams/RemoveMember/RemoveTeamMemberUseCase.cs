using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Teams.RemoveMember;
public class RemoveTeamMemberUseCase : IRemoveTeamMemberUseCase
{
    private readonly ITeamUpdateOnlyRepository _repository;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveTeamMemberUseCase(ITeamUpdateOnlyRepository repository, ILoggedUser loggedUser, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long teamId, long userId)
    {
        var loggedUser = await _loggedUser.User();

        var team = await _repository.GetById(teamId);

        if (team is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.TEAM_NOT_FOUND);
        }

        if (team.CanBeManagedBy(loggedUser) == false)
        {
            throw new ForbiddenException(ResourceErrorsMessage.FORBIDDEN_ACTION);
        }

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        if (team.LeaderId == userId)
        {
            throw new ConflictException(ResourceErrorsMessage.CANNOT_REMOVE_TEAM_LEADER);
        }

        var member = team.Members.Find(m => m.UserId == userId);

        if (member is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.USER_NOT_TEAM_MEMBER);
        }

        team.Members.Remove(member);

        await _unitOfWork.Commit();
    }
}
