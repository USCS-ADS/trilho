using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Teams;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Teams.Archive;
public class ArchiveTeamUseCase : IArchiveTeamUseCase
{
    private readonly ITeamUpdateOnlyRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public ArchiveTeamUseCase(ITeamUpdateOnlyRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long id)
    {
        var team = await _repository.GetById(id);

        if (team is null)
        {
            throw new NotFoundException(ResourceErrorsMessage.TEAM_NOT_FOUND);
        }

        if (team.IsArchived)
        {
            return;
        }

        team.IsArchived = true;

        _repository.Update(team);

        await _unitOfWork.Commit();
    }
}
