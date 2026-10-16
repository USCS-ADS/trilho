using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Git;

namespace Trilho.Application.UseCases.Git.Webhook;
public class RegisterGitEventFailureUseCase : IRegisterGitEventFailureUseCase
{
    private const int MaxErrorLength = 500;

    private readonly IPendingGitEventUpdateOnlyRepository _eventRepository;
    private readonly IGitRepositoryUpdateOnlyRepository _repositoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterGitEventFailureUseCase(
        IPendingGitEventUpdateOnlyRepository eventRepository,
        IGitRepositoryUpdateOnlyRepository repositoryRepository,
        IUnitOfWork unitOfWork)
    {
        _eventRepository = eventRepository;
        _repositoryRepository = repositoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long pendingEventId, string error)
    {
        var pending = await _eventRepository.GetById(pendingEventId);

        if (pending is null)
        {
            return;
        }

        pending.Attempts++;
        pending.LastError = error.Length <= MaxErrorLength ? error : error[..MaxErrorLength];
        _eventRepository.Update(pending);

        var repository = await _repositoryRepository.GetById(pending.RepositoryId);

        if (repository is not null)
        {
            repository.Status = GitSyncStatuses.ERROR;
            _repositoryRepository.Update(repository);
        }

        await _unitOfWork.Commit();
    }
}
