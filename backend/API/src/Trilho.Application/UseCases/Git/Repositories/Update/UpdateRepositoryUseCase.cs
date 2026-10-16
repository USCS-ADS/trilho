using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Requests.Git;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Git;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Git.Repositories.Update;
public class UpdateRepositoryUseCase : IUpdateRepositoryUseCase
{
    private readonly IGitRepositoryUpdateOnlyRepository _repository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRepositoryUseCase(
        IGitRepositoryUpdateOnlyRepository repository,
        ITaskAccessGuard guard,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _guard = guard;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
    }

    public async Task Execute(long id, RequestUpdateRepositoryJson request)
    {
        var events = request.Events?.Distinct().ToList() ?? [];

        if (events.Count == 0 || events.All(e => GitEventTypes.IsValid(e)) == false)
        {
            throw new ErrorOnValidationException([ResourceErrorsMessage.GIT_EVENTS_INVALID]);
        }

        var user = await _loggedUser.User();

        var repository = await _repository.GetById(id)
            ?? throw new NotFoundException(ResourceErrorsMessage.GIT_REPOSITORY_NOT_FOUND);

        await _guard.GetTeamForManager(user, repository.TeamId);

        repository.Events = string.Join(',', events);
        _repository.Update(repository);

        await _unitOfWork.Commit();
    }
}
