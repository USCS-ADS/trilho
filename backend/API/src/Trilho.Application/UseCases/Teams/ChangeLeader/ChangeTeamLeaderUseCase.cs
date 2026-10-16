using Trilho.Application.UseCases.Teams.Shared;
using Trilho.Communication.Requests.Teams;
using Trilho.Domain.Entities;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Teams;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Teams.ChangeLeader;
public class ChangeTeamLeaderUseCase : IChangeTeamLeaderUseCase
{
    private readonly ITeamUpdateOnlyRepository _repository;
    private readonly ITeamLeaderGuard _leaderGuard;
    private readonly IUnitOfWork _unitOfWork;

    public ChangeTeamLeaderUseCase(ITeamUpdateOnlyRepository repository, ITeamLeaderGuard leaderGuard, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _leaderGuard = leaderGuard;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long id, RequestChangeLeaderJson request)
    {
        var validation = new ChangeTeamLeaderValidator().Validate(request);

        if (validation.IsValid == false)
        {
            throw new ErrorOnValidationException(validation.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var team = await _repository.GetById(id);

        if (team is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.TEAM_NOT_FOUND);
        }

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        if (team.LeaderId == request.LeaderId)
        {
            return;
        }

        var newLeader = await _leaderGuard.EnsureCanLead(request.LeaderId, ignoreTeamId: team.Id);

        team.LeaderId = newLeader.Id;

        // O novo líder passa a participar do time; o líder anterior continua como membro.
        if (team.HasMember(newLeader.Id) == false)
        {
            team.Members.Add(new TeamMember { TeamId = team.Id, UserId = newLeader.Id, JoinedAt = DateTime.UtcNow });
        }

        _repository.Update(team);

        await _unitOfWork.Commit();
    }
}
