using Trilho.Communication.Requests.Teams;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Repositories.Users;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Teams.AddMember;
public class AddTeamMemberUseCase : IAddTeamMemberUseCase
{
    private readonly ITeamUpdateOnlyRepository _teamRepository;
    private readonly IUserReadOnlyRepository _userRepository;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public AddTeamMemberUseCase(
        ITeamUpdateOnlyRepository teamRepository,
        IUserReadOnlyRepository userRepository,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork)
    {
        _teamRepository = teamRepository;
        _userRepository = userRepository;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long teamId, RequestTeamMemberJson request)
    {
        var validation = new AddTeamMemberValidator().Validate(request);

        if (validation.IsValid == false)
        {
            throw new ErrorOnValidationException(validation.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var loggedUser = await _loggedUser.User();

        var team = await _teamRepository.GetById(teamId);

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

        var user = await _userRepository.GetById(request.UserId);

        if (user is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.USER_NOT_FOUND);
        }

        if (user.IsActive == false)
        {
            throw new ErrorOnValidationException([ResourceErrorsMessage.USER_NOT_ACTIVE]);
        }

        if (team.HasMember(user.Id))
        {
            throw new ConflictException(ResourceErrorsMessage.USER_ALREADY_TEAM_MEMBER);
        }

        team.Members.Add(new TeamMember { TeamId = team.Id, UserId = user.Id, JoinedAt = DateTime.UtcNow });

        await _unitOfWork.Commit();
    }
}
