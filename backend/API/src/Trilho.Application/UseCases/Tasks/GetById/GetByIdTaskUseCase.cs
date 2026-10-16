using AutoMapper;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Responses.Tasks;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Tasks.GetById;
public class GetByIdTaskUseCase : IGetByIdTaskUseCase
{
    private readonly ITaskReadOnlyRepository _repository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IMapper _mapper;
    private readonly TimeProvider _timeProvider;

    public GetByIdTaskUseCase(
        ITaskReadOnlyRepository repository,
        ITaskAccessGuard guard,
        ILoggedUser loggedUser,
        IMapper mapper,
        TimeProvider timeProvider)
    {
        _repository = repository;
        _guard = guard;
        _loggedUser = loggedUser;
        _mapper = mapper;
        _timeProvider = timeProvider;
    }

    public async Task<ResponseTaskJson> Execute(long id)
    {
        var user = await _loggedUser.User();

        var task = await _repository.GetById(id) ?? throw new NotFoundException(ResourceErrorsMessage.TASK_NOT_FOUND);

        await _guard.GetTeamForMember(user, task.TeamId);

        return _mapper.ToDetail(task, _timeProvider.Today());
    }
}
