using Trilho.Application.UseCases.Git.Shared;
using Trilho.Application.UseCases.Notifications.Shared;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Git;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.Git;

namespace Trilho.Application.UseCases.Git.Webhook;
/// <summary>
/// Aplica um evento do provedor às tarefas (RF06): PR aberto → Em Revisão; merge → Concluído;
/// commits atualizam branch e último commit. Só afeta tarefas do time do repositório.
/// </summary>
public class ProcessGitEventUseCase : IProcessGitEventUseCase
{
    private readonly IPendingGitEventUpdateOnlyRepository _eventRepository;
    private readonly IGitRepositoryUpdateOnlyRepository _repositoryRepository;
    private readonly ITaskUpdateOnlyRepository _taskRepository;
    private readonly IEnumerable<IGitProvider> _providers;
    private readonly ITaskNotifier _notifier;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public ProcessGitEventUseCase(
        IPendingGitEventUpdateOnlyRepository eventRepository,
        IGitRepositoryUpdateOnlyRepository repositoryRepository,
        ITaskUpdateOnlyRepository taskRepository,
        IEnumerable<IGitProvider> providers,
        ITaskNotifier notifier,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        _eventRepository = eventRepository;
        _repositoryRepository = repositoryRepository;
        _taskRepository = taskRepository;
        _providers = providers;
        _notifier = notifier;
        _unitOfWork = unitOfWork;
        _timeProvider = timeProvider;
    }

    public async Task Execute(long pendingEventId)
    {
        var pending = await _eventRepository.GetById(pendingEventId);

        if (pending is null || pending.ProcessedAt is not null)
        {
            return;
        }

        var repository = await _repositoryRepository.GetById(pending.RepositoryId);

        if (repository is null)
        {
            return;
        }

        var provider = _providers.First(candidate => candidate.Name == repository.Provider);
        var gitEvent = provider.Parse(pending.EventType, pending.Payload);
        var now = _timeProvider.GetUtcNow().UtcDateTime;

        if (gitEvent is not null && repository.Listens(RequiredEvent(gitEvent.Kind)))
        {
            await Apply(repository, gitEvent);
        }

        pending.ProcessedAt = now;
        pending.LastError = null;
        _eventRepository.Update(pending);

        repository.LastSyncAt = now;
        repository.Status = GitSyncStatuses.CONNECTED;
        _repositoryRepository.Update(repository);

        await _unitOfWork.Commit();
    }

    private async Task Apply(GitRepository repository, GitEvent gitEvent)
    {
        var references = TaskReferenceExtractor.Extract(
            new[] { gitEvent.Branch, gitEvent.Title, gitEvent.Body }.Concat(gitEvent.CommitMessages));

        foreach (var taskId in references)
        {
            var task = await _taskRepository.GetById(taskId);

            // Referência a tarefa inexistente ou de outro time é ignorada: um repositório só mexe no próprio time.
            if (task is null || task.TeamId != repository.TeamId)
            {
                continue;
            }

            var moved = ApplyToTask(task, gitEvent);

            if (moved)
            {
                // Sem ator humano: o aviso vai para responsável e criador da tarefa.
                await _notifier.StatusChanged(task, previousStatus: null, task.Status, actorId: 0);
            }

            _taskRepository.Update(task);
        }
    }

    /// <summary>Aplica o evento à tarefa. Retorna verdadeiro se o status mudou.</summary>
    private static bool ApplyToTask(TaskItem task, GitEvent gitEvent)
    {
        var previousStatus = task.Status;

        if (string.IsNullOrWhiteSpace(gitEvent.Branch) == false)
        {
            task.GitBranch = gitEvent.Branch.Length <= 250 ? gitEvent.Branch : gitEvent.Branch[..250];
        }

        if (task.LastCommitAt is null || gitEvent.OccurredAt > task.LastCommitAt)
        {
            task.LastCommitAt = gitEvent.OccurredAt;
        }

        switch (gitEvent.Kind)
        {
            case GitEventKind.PullRequestOpened:
                task.PullRequestNumber = gitEvent.PullRequestNumber ?? task.PullRequestNumber;
                task.PullRequestState = "open";
                MoveTo(task, TaskStatuses.IN_REVIEW, gitEvent);
                task.Record(null, TaskActivityTypes.GIT_PR_OPENED, toValue: PullRequestLabel(gitEvent));
                break;

            case GitEventKind.PullRequestUpdated:
                task.PullRequestNumber = gitEvent.PullRequestNumber ?? task.PullRequestNumber;
                task.PullRequestState ??= "open";
                break;

            case GitEventKind.PullRequestMerged:
                task.PullRequestNumber = gitEvent.PullRequestNumber ?? task.PullRequestNumber;
                task.PullRequestState = "merged";
                task.Record(null, TaskActivityTypes.GIT_PR_MERGED, toValue: PullRequestLabel(gitEvent));

                // RF04: subtarefas pendentes impedem concluir; a tarefa fica em revisão até serem concluídas.
                MoveTo(task, task.HasPendingSubtasks ? TaskStatuses.IN_REVIEW : TaskStatuses.DONE, gitEvent);
                break;

            case GitEventKind.PullRequestClosed:
                task.PullRequestNumber = gitEvent.PullRequestNumber ?? task.PullRequestNumber;
                task.PullRequestState = "closed";
                task.Record(null, TaskActivityTypes.GIT_PR_CLOSED, toValue: PullRequestLabel(gitEvent));
                break;
        }

        var moved = previousStatus != task.Status;

        if (moved)
        {
            task.UpdatedAt = gitEvent.OccurredAt;
        }

        return moved;
    }

    private static void MoveTo(TaskItem task, string status, GitEvent gitEvent)
    {
        // Tarefa já concluída não volta para revisão por um novo PR/commit.
        if (task.Status == status || task.Status == TaskStatuses.DONE)
        {
            return;
        }

        var from = task.Status;
        task.Status = status;
        task.CompletedAt = status == TaskStatuses.DONE ? gitEvent.OccurredAt : null;
        task.Record(null, TaskActivityTypes.STATUS_CHANGED, from, status);
    }

    private static string PullRequestLabel(GitEvent gitEvent)
    {
        return gitEvent.PullRequestNumber is null ? "PR" : $"PR #{gitEvent.PullRequestNumber}";
    }

    private static string RequiredEvent(GitEventKind kind) => kind switch
    {
        GitEventKind.Commit or GitEventKind.PullRequestUpdated => GitEventTypes.COMMIT,
        GitEventKind.PullRequestMerged => GitEventTypes.MERGE,
        _ => GitEventTypes.PULL_REQUEST
    };
}
