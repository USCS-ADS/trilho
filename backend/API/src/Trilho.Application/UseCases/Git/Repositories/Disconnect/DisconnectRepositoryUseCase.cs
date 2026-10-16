using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Git;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Git.Repositories.Disconnect;
public class DisconnectRepositoryUseCase : IDisconnectRepositoryUseCase
{
    private readonly IGitRepositoryReadOnlyRepository _readRepository;
    private readonly IGitRepositoryWriteOnlyRepository _writeRepository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public DisconnectRepositoryUseCase(
        IGitRepositoryReadOnlyRepository readRepository,
        IGitRepositoryWriteOnlyRepository writeRepository,
        ITaskAccessGuard guard,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork)
    {
        _readRepository = readRepository;
        _writeRepository = writeRepository;
        _guard = guard;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long id)
    {
        var user = await _loggedUser.User();

        var repository = await _readRepository.GetById(id)
            ?? throw new NotFoundException(ResourceErrorsMessage.GIT_REPOSITORY_NOT_FOUND);

        await _guard.GetTeamForManager(user, repository.TeamId);

        await _writeRepository.Delete(id);
        await _unitOfWork.Commit();
    }
}
