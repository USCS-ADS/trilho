using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Tasks.Delete;
public class DeleteTaskUseCase : IDeleteTaskUseCase
{
    private readonly ITaskUpdateOnlyRepository _updateRepository;
    private readonly ITaskWriteOnlyRepository _writeRepository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTaskUseCase(
        ITaskUpdateOnlyRepository updateRepository,
        ITaskWriteOnlyRepository writeRepository,
        ITaskAccessGuard guard,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork)
    {
        _updateRepository = updateRepository;
        _writeRepository = writeRepository;
        _guard = guard;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long id)
    {
        var user = await _loggedUser.User();

        var task = await _updateRepository.GetById(id) ?? throw new NotFoundException(ResourceErrorsMessage.TASK_NOT_FOUND);

        await _guard.GetTeamForManager(user, task.TeamId);

        if (task.HasPendingSubtasks)
        {
            throw new ConflictException(ResourceErrorsMessage.TASK_HAS_PENDING_SUBTASKS);
        }

        await _writeRepository.Delete(id);
        await _unitOfWork.Commit();
    }
}
