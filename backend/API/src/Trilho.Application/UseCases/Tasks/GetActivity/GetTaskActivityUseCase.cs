using AutoMapper;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Responses.Tasks;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Tasks.GetActivity;
public class GetTaskActivityUseCase : IGetTaskActivityUseCase
{
    private readonly ITaskReadOnlyRepository _repository;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IMapper _mapper;

    public GetTaskActivityUseCase(ITaskReadOnlyRepository repository, ITaskAccessGuard guard, ILoggedUser loggedUser, IMapper mapper)
    {
        _repository = repository;
        _guard = guard;
        _loggedUser = loggedUser;
        _mapper = mapper;
    }

    public async Task<List<ResponseActivityJson>> Execute(long taskId)
    {
        var user = await _loggedUser.User();

        var task = await _repository.GetById(taskId) ?? throw new NotFoundException(ResourceErrorsMessage.TASK_NOT_FOUND);

        await _guard.GetTeamForMember(user, task.TeamId);

        var activities = await _repository.GetActivity(taskId);

        return _mapper.Map<List<ResponseActivityJson>>(activities);
    }
}
