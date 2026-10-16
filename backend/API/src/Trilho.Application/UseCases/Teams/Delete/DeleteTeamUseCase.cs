using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Repositories.Teams;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Teams.Delete;
public class DeleteTeamUseCase : IDeleteTeamUseCase
{
    private readonly ITeamWriteOnlyRepository _repository;
    private readonly ITaskReadOnlyRepository _taskRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTeamUseCase(ITeamWriteOnlyRepository repository, ITaskReadOnlyRepository taskRepository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _taskRepository = taskRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long id)
    {
        // O histórico de tarefas não se perde: com tarefas, o caminho é arquivar o time.
        if (await _taskRepository.ExistsForTeam(id))
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_HAS_TASKS);
        }

        var deleted = await _repository.Delete(id);

        if (deleted == false)
        {
            throw new NotFoundException(ResourceErrorsMessage.TEAM_NOT_FOUND);
        }

        await _unitOfWork.Commit();
    }
}
