using System.Security.Cryptography;
using System.Text;
using CommonTestUtilities.Entities;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Trilho.Application.UseCases.Git.Shared;
using Trilho.Application.UseCases.Git.Webhook;
using Trilho.Application.UseCases.Notifications.Shared;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Git;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.Git;

namespace UseCases.Test.Git;
public class GitIntegrationTests
{
    // ---- Extração de referências

    [Theory]
    [InlineData("feature/task-128-endpoint", 128)]
    [InlineData("Corrige o bug da fila #45", 45)]
    [InlineData("TRILHO-9: ajuste", 9)]
    [InlineData("hotfix/Task_77", 77)]
    public void Extractor_FindsTaskReferences(string text, long expected)
    {
        Assert.Contains(expected, TaskReferenceExtractor.Extract([text]));
    }

    [Fact]
    public void Extractor_DeduplicatesAndIgnoresPlainNumbers()
    {
        var ids = TaskReferenceExtractor.Extract(["task-5 e #5 e #6", "versão 2024 sem referência", null]);

        Assert.Equal([5L, 6L], ids.ToArray());
    }

    // ---- Provedores (via tipos de teste que replicam o contrato público do webhook)

    private static string HubSignature(string secret, string body)
        => "sha256=" + Convert.ToHexString(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(body))).ToLowerInvariant();

    // ---- Processamento do evento

    private readonly Mock<IPendingGitEventUpdateOnlyRepository> _events = new();
    private readonly Mock<IGitRepositoryUpdateOnlyRepository> _repositories = new();
    private readonly Mock<ITaskUpdateOnlyRepository> _tasks = new();
    private readonly Mock<IGitProvider> _provider = new();
    private readonly Mock<ITaskNotifier> _notifier = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private ProcessGitEventUseCase UseCase()
    {
        _provider.SetupGet(p => p.Name).Returns(GitProviders.GITHUB);

        return new ProcessGitEventUseCase(
            _events.Object, _repositories.Object, _tasks.Object, [_provider.Object], _notifier.Object, _unitOfWork.Object, TimeProvider.System);
    }

    private static GitRepository Repo(string events = "commit,pull_request,merge")
        => new() { Id = 1, Provider = GitProviders.GITHUB, FullName = "trilho/backend", TeamId = 5, Events = events };

    private void GivenEvent(GitRepository repository, GitEvent gitEvent)
    {
        var pending = new PendingGitEvent { Id = 10, RepositoryId = repository.Id, EventType = "x", Payload = "{}" };
        _events.Setup(r => r.GetById(10)).ReturnsAsync(pending);
        _repositories.Setup(r => r.GetById(repository.Id)).ReturnsAsync(repository);
        _provider.Setup(p => p.Parse("x", "{}")).Returns(gitEvent);
    }

    private static GitEvent Event(GitEventKind kind, string branch = "feature/task-1-x", int? pr = 7, string? title = null)
        => new(kind, branch, pr, title, null, [], DateTime.UtcNow);

    private static TaskItem Task(long id, long teamId = 5, string status = TaskStatuses.IN_PROGRESS, bool pendingSubtask = false)
    {
        var task = new TaskItem { Id = id, TeamId = teamId, Status = status, Title = "T" };

        if (pendingSubtask)
        {
            task.Subtasks.Add(new Subtask { Id = 1, IsDone = false });
        }

        return task;
    }

    [Fact]
    public async Task PullRequestOpened_MovesTaskToReview_AndLinksBranchAndPr()
    {
        var repository = Repo();
        var task = Task(1);
        GivenEvent(repository, Event(GitEventKind.PullRequestOpened));
        _tasks.Setup(r => r.GetById(1)).ReturnsAsync(task);

        await UseCase().Execute(10);

        Assert.Equal(TaskStatuses.IN_REVIEW, task.Status);
        Assert.Equal("feature/task-1-x", task.GitBranch);
        Assert.Equal(7, task.PullRequestNumber);
        Assert.Equal("open", task.PullRequestState);
        Assert.Contains(task.Activities, a => a.Type == TaskActivityTypes.STATUS_CHANGED && a.ActorId is null);
        _unitOfWork.Verify(u => u.Commit(), Times.Once);
    }

    [Fact]
    public async Task Merge_CompletesTask_AndSetsCompletedAt()
    {
        var repository = Repo();
        var task = Task(1, status: TaskStatuses.IN_REVIEW);
        GivenEvent(repository, Event(GitEventKind.PullRequestMerged));
        _tasks.Setup(r => r.GetById(1)).ReturnsAsync(task);

        await UseCase().Execute(10);

        Assert.Equal(TaskStatuses.DONE, task.Status);
        Assert.NotNull(task.CompletedAt);
        Assert.Equal("merged", task.PullRequestState);
    }

    [Fact]
    public async Task Merge_WithPendingSubtasks_KeepsTaskInReview()
    {
        var repository = Repo();
        var task = Task(1, status: TaskStatuses.IN_PROGRESS, pendingSubtask: true);
        GivenEvent(repository, Event(GitEventKind.PullRequestMerged));
        _tasks.Setup(r => r.GetById(1)).ReturnsAsync(task);

        await UseCase().Execute(10);

        Assert.Equal(TaskStatuses.IN_REVIEW, task.Status);
        Assert.Null(task.CompletedAt);
        Assert.Equal("merged", task.PullRequestState);
    }

    [Fact]
    public async Task TaskFromAnotherTeam_IsIgnored()
    {
        var repository = Repo();
        var foreign = Task(1, teamId: 99);
        GivenEvent(repository, Event(GitEventKind.PullRequestOpened));
        _tasks.Setup(r => r.GetById(1)).ReturnsAsync(foreign);

        await UseCase().Execute(10);

        Assert.Equal(TaskStatuses.IN_PROGRESS, foreign.Status);
        Assert.Null(foreign.GitBranch);
    }

    [Fact]
    public async Task DisabledEvent_IsAcknowledgedWithoutChangingTasks()
    {
        var repository = Repo(events: "commit");
        var task = Task(1);
        GivenEvent(repository, Event(GitEventKind.PullRequestOpened));
        _tasks.Setup(r => r.GetById(1)).ReturnsAsync(task);

        await UseCase().Execute(10);

        Assert.Equal(TaskStatuses.IN_PROGRESS, task.Status);
        _unitOfWork.Verify(u => u.Commit(), Times.Once);
    }

    [Fact]
    public async Task Commit_OnlyUpdatesBranchAndLastCommit_NotStatus()
    {
        var repository = Repo();
        var task = Task(1, status: TaskStatuses.TODO);
        GivenEvent(repository, new GitEvent(GitEventKind.Commit, "feature/task-1", null, null, null, ["wip #1"], new DateTime(2026, 10, 1, 12, 0, 0, DateTimeKind.Utc)));
        _tasks.Setup(r => r.GetById(1)).ReturnsAsync(task);

        await UseCase().Execute(10);

        Assert.Equal(TaskStatuses.TODO, task.Status);
        Assert.Equal("feature/task-1", task.GitBranch);
        Assert.Equal(new DateTime(2026, 10, 1, 12, 0, 0, DateTimeKind.Utc), task.LastCommitAt);
    }

    [Fact]
    public async Task AlreadyProcessedEvent_IsSkipped()
    {
        var repository = Repo();
        _events.Setup(r => r.GetById(10)).ReturnsAsync(new PendingGitEvent { Id = 10, RepositoryId = 1, ProcessedAt = DateTime.UtcNow });
        _repositories.Setup(r => r.GetById(1)).ReturnsAsync(repository);

        await UseCase().Execute(10);

        _unitOfWork.Verify(u => u.Commit(), Times.Never);
    }

    [Fact]
    public void SignatureHelper_ProducesGitHubFormat()
    {
        var signature = HubSignature("segredo", "{}");

        Assert.StartsWith("sha256=", signature);
        Assert.Equal(7 + 64, signature.Length);
    }
}
