using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Teams;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Teams.Restore;
public class RestoreTeamUseCase : IRestoreTeamUseCase
{
    private readonly ITeamUpdateOnlyRepository _updateRepository;
    private readonly ITeamReadOnlyRepository _readRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RestoreTeamUseCase(ITeamUpdateOnlyRepository updateRepository, ITeamReadOnlyRepository readRepository, IUnitOfWork unitOfWork)
    {
        _updateRepository = updateRepository;
        _readRepository = readRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long id)
    {
        var team = await _updateRepository.GetById(id);

        if (team is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.TEAM_NOT_FOUND);
        }

        if (team.IsArchived == false)
        {
            return;
        }

        // Enquanto arquivado, o líder pode ter assumido outro time (RF02: um time ativo por vez).
        if (await _readRepository.ExistsTeamLedBy(team.LeaderId, ignoreTeamId: team.Id))
        {
            throw new ConflictException(ResourceErrorsMessage.USER_ALREADY_LEADS_TEAM);
        }

        team.IsArchived = false;

        _updateRepository.Update(team);

        await _unitOfWork.Commit();
    }
}
