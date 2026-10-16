using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Requests.Prioritization;
using Trilho.Communication.Responses.Prioritization;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Domain.Services.Prioritization;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Prioritization.ApplyRanking;
public class ApplyRankingUseCase : IApplyRankingUseCase
{
    private readonly ITaskUpdateOnlyRepository _repository;
    private readonly IPrioritizationEngine _engine;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public ApplyRankingUseCase(
        ITaskUpdateOnlyRepository repository,
        IPrioritizationEngine engine,
        ITaskAccessGuard guard,
        ILoggedUser loggedUser,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        _repository = repository;
        _engine = engine;
        _guard = guard;
        _loggedUser = loggedUser;
        _unitOfWork = unitOfWork;
        _timeProvider = timeProvider;
    }

    public async Task<ResponseApplyRankingJson> Execute(RequestApplyRankingJson request)
    {
        if (request.TeamId <= 0)
        {
            throw new ErrorOnValidationException([ResourceErrorsMessage.TASK_TEAM_REQUIRED]);
        }

        var user = await _loggedUser.User();

        // RF07: aplicar a priorização é decisão da liderança (líder do time ou administrador).
        var team = await _guard.GetTeamForManager(user, request.TeamId);

        if (team.IsArchived)
        {
            throw new ConflictException(ResourceErrorsMessage.TEAM_ARCHIVED);
        }

        var tasks = await _repository.GetOpenByTeam(team.Id);
        var today = _timeProvider.Today();
        var now = _timeProvider.GetUtcNow().UtcDateTime;

        var response = new ResponseApplyRankingJson();

        foreach (var task in tasks)
        {
            // Urgente declarada pela liderança nunca é rebaixada.
            if (task.Priority == TaskPriorities.URGENT)
            {
                continue;
            }

            var suggested = _engine.SuggestPriority(today, task.DueDate);

            if (suggested == task.Priority)
            {
                continue;
            }

            response.Changes.Add(new ResponsePriorityChangeJson { TaskId = task.Id, From = task.Priority, To = suggested });

            task.Record(user.Id, TaskActivityTypes.PRIORITY_CHANGED, task.Priority, suggested);
            task.Priority = suggested;
            task.UpdatedAt = now;

            _repository.Update(task);
        }

        response.Updated = response.Changes.Count;

        if (response.Updated > 0)
        {
            await _unitOfWork.Commit();
        }

        return response;
    }
}
