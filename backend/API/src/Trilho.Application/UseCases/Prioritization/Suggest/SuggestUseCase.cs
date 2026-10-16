using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Requests.Prioritization;
using Trilho.Communication.Responses.Prioritization;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Domain.Services.Prioritization;
using Trilho.Exception.ExceptionBase;

namespace Trilho.Application.UseCases.Prioritization.Suggest;
public class SuggestUseCase : ISuggestUseCase
{
    private readonly ITaskReadOnlyRepository _taskRepository;
    private readonly IPrioritizationEngine _engine;
    private readonly ITaskAccessGuard _guard;
    private readonly ILoggedUser _loggedUser;
    private readonly TimeProvider _timeProvider;

    public SuggestUseCase(
        ITaskReadOnlyRepository taskRepository,
        IPrioritizationEngine engine,
        ITaskAccessGuard guard,
        ILoggedUser loggedUser,
        TimeProvider timeProvider)
    {
        _taskRepository = taskRepository;
        _engine = engine;
        _guard = guard;
        _loggedUser = loggedUser;
        _timeProvider = timeProvider;
    }

    public async Task<ResponsePrioritySuggestionJson> Execute(RequestSuggestionJson request)
    {
        var validation = new SuggestionValidator().Validate(request);

        if (validation.IsValid == false)
        {
            throw new ErrorOnValidationException(validation.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var user = await _loggedUser.User();
        var team = await _guard.GetTeamForMember(user, request.TeamId);

        var today = _timeProvider.Today();
        var priority = _engine.SuggestPriority(today, request.DueDate);

        var memberIds = team.Members.Select(member => member.UserId).ToList();
        var openByUser = await _taskRepository.CountOpenByAssignee(memberIds);

        var candidates = team.Members
            .Where(member => member.User is { IsActive: true })
            .Select(member => new AssigneeCandidate(member.UserId, member.User!.Name, openByUser.GetValueOrDefault(member.UserId)))
            .ToList();

        var assignee = _engine.SuggestAssignee(candidates);

        return new ResponsePrioritySuggestionJson
        {
            Priority = priority,
            Justification = _engine.Justify(priority, today, request.DueDate),
            SuggestedAssignee = assignee is null
                ? null
                : new ResponseAssigneeSuggestionJson { UserId = assignee.UserId, Name = assignee.Name, OpenTasks = assignee.OpenTasks }
        };
    }
}
