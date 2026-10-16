using AutoMapper;
using CommonTestUtilities.Entities;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Trilho.Application.AutoMapper;
using Trilho.Application.UseCases.Comments.Delete;
using Trilho.Application.UseCases.Notifications.Shared;
using Trilho.Application.UseCases.Subtasks.Create;
using Trilho.Application.UseCases.Tasks.Create;
using Trilho.Application.UseCases.Tasks.Delete;
using Trilho.Application.UseCases.Tasks.Move;
using Trilho.Application.UseCases.Tasks.Shared;
using Trilho.Communication.Requests.Tasks;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Repositories.Teams;
using Trilho.Domain.Services.LoggedUser;
using Trilho.Exception;
using Trilho.Exception.ExceptionBase;

namespace UseCases.Test.Tasks;
public class TaskUseCasesTests
{
    private readonly Mock<ITeamReadOnlyRepository> _teamRead = new();
    private readonly Mock<ITaskReadOnlyRepository> _taskRead = new();
    private readonly Mock<ITaskUpdateOnlyRepository> _taskUpdate = new();
    private readonly Mock<ITaskWriteOnlyRepository> _taskWrite = new();
    private readonly Mock<ILoggedUser> _loggedUser = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<ITaskNotifier> _notifier = new();

    private ITaskAccessGuard Guard() => new TaskAccessGuard(_teamRead.Object);

    private static IMapper Mapper() =>
        new MapperConfiguration(cfg => cfg.AddProfile<AutoMapping>(), NullLoggerFactory.Instance).CreateMapper();

    private static Team BuildTeam(User leader, bool archived = false, params User[] members)
    {
        var team = new Team { Id = 5, Name = "Backend", LeaderId = leader.Id, IsArchived = archived };
        team.Members.Add(new TeamMember { TeamId = 5, UserId = leader.Id, User = leader });

        foreach (var member in members)
        {
            team.Members.Add(new TeamMember { TeamId = 5, UserId = member.Id, User = member });
        }

        return team;
    }

    private void GivenTeam(Team team) => _teamRead.Setup(r => r.GetById(team.Id)).ReturnsAsync(team);
    private void LoggedAs(User user) => _loggedUser.Setup(l => l.User()).ReturnsAsync(user);

    private static TaskItem BuildTask(string status = TaskStatuses.TODO, params Subtask[] subtasks)
    {
        var task = new TaskItem { Id = 77, Title = "Tarefa", TeamId = 5, Status = status, Priority = TaskPriorities.MEDIUM };
        task.Subtasks.AddRange(subtasks);

        return task;
    }

    // ---- Create

    [Fact]
    public async Task Create_AssigneeOutsideTeam_IsRejected()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        var outsider = UserBuilder.Build(Roles.USER);
        GivenTeam(BuildTeam(leader));
        LoggedAs(leader);
        var useCase = new CreateTaskUseCase(_taskWrite.Object, _taskRead.Object, Guard(), _loggedUser.Object, _unitOfWork.Object, Mapper(), _notifier.Object, TimeProvider.System);

        var exception = await Assert.ThrowsAsync<ErrorOnValidationException>(() => useCase.Execute(
            new RequestTaskJson { Title = "T", TeamId = 5, Priority = TaskPriorities.LOW, AssigneeId = outsider.Id }));

        Assert.Contains(ResourceErrorsMessage.TASK_ASSIGNEE_NOT_TEAM_MEMBER, exception.GetErrors());
        _unitOfWork.Verify(u => u.Commit(), Times.Never);
    }

    [Fact]
    public async Task Create_InArchivedTeam_IsConflict()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        GivenTeam(BuildTeam(leader, archived: true));
        LoggedAs(leader);
        var useCase = new CreateTaskUseCase(_taskWrite.Object, _taskRead.Object, Guard(), _loggedUser.Object, _unitOfWork.Object, Mapper(), _notifier.Object, TimeProvider.System);

        await Assert.ThrowsAsync<ConflictException>(() => useCase.Execute(
            new RequestTaskJson { Title = "T", TeamId = 5, Priority = TaskPriorities.LOW }));
    }

    [Fact]
    public async Task Create_Valid_UsesNextPositionAndRecordsActivity()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        GivenTeam(BuildTeam(leader));
        LoggedAs(leader);
        _taskRead.Setup(r => r.GetNextPosition(5, TaskStatuses.BACKLOG)).ReturnsAsync(3);

        TaskItem? created = null;
        _taskWrite.Setup(r => r.Create(It.IsAny<TaskItem>())).Callback<TaskItem>(t => { t.Id = 90; created = t; }).Returns(Task.CompletedTask);
        _taskRead.Setup(r => r.GetById(90)).ReturnsAsync(() => created);

        var useCase = new CreateTaskUseCase(_taskWrite.Object, _taskRead.Object, Guard(), _loggedUser.Object, _unitOfWork.Object, Mapper(), _notifier.Object, TimeProvider.System);

        var response = await useCase.Execute(new RequestTaskJson { Title = "  Nova  ", TeamId = 5, Priority = TaskPriorities.HIGH });

        Assert.Equal("Nova", response.Title);
        Assert.Equal(3, created!.Position);
        Assert.Contains(created.Activities, a => a.Type == TaskActivityTypes.CREATED && a.ActorId == leader.Id);
    }

    // ---- Move

    [Fact]
    public async Task Move_ToDoneWithPendingSubtasks_IsConflict()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        GivenTeam(BuildTeam(leader));
        LoggedAs(leader);
        _taskUpdate.Setup(r => r.GetById(77)).ReturnsAsync(BuildTask(TaskStatuses.IN_REVIEW, new Subtask { Id = 1, IsDone = false }));
        var useCase = new MoveTaskUseCase(_taskUpdate.Object, Guard(), _loggedUser.Object, _unitOfWork.Object, _notifier.Object, TimeProvider.System);

        await Assert.ThrowsAsync<ConflictException>(() => useCase.Execute(77, new RequestMoveTaskJson { Status = TaskStatuses.DONE, Position = 0 }));
    }

    [Fact]
    public async Task Move_ReordersTargetColumn_SetsCompletedAtAndRecordsActivity()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        GivenTeam(BuildTeam(leader));
        LoggedAs(leader);

        var task = BuildTask(TaskStatuses.IN_REVIEW, new Subtask { Id = 1, IsDone = true });
        var other1 = new TaskItem { Id = 1, Status = TaskStatuses.DONE, Position = 0 };
        var other2 = new TaskItem { Id = 2, Status = TaskStatuses.DONE, Position = 1 };
        _taskUpdate.Setup(r => r.GetById(77)).ReturnsAsync(task);
        _taskUpdate.Setup(r => r.GetColumn(5, TaskStatuses.DONE)).ReturnsAsync([other1, other2]);
        var useCase = new MoveTaskUseCase(_taskUpdate.Object, Guard(), _loggedUser.Object, _unitOfWork.Object, _notifier.Object, TimeProvider.System);

        await useCase.Execute(77, new RequestMoveTaskJson { Status = TaskStatuses.DONE, Position = 1 });

        Assert.Equal(0, other1.Position);
        Assert.Equal(1, task.Position);
        Assert.Equal(2, other2.Position);
        Assert.NotNull(task.CompletedAt);
        Assert.Contains(task.Activities, a => a.Type == TaskActivityTypes.STATUS_CHANGED && a.FromValue == TaskStatuses.IN_REVIEW && a.ToValue == TaskStatuses.DONE);
        _unitOfWork.Verify(u => u.Commit(), Times.Once);
    }

    [Fact]
    public async Task Move_InvalidStatus_IsRejected()
    {
        var useCase = new MoveTaskUseCase(_taskUpdate.Object, Guard(), _loggedUser.Object, _unitOfWork.Object, _notifier.Object, TimeProvider.System);

        await Assert.ThrowsAsync<ErrorOnValidationException>(() => useCase.Execute(77, new RequestMoveTaskJson { Status = "wip", Position = 0 }));
    }

    // ---- Subtask / Delete / Comment

    [Fact]
    public async Task CreateSubtask_OnDoneTask_IsConflict()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        GivenTeam(BuildTeam(leader));
        LoggedAs(leader);
        _taskUpdate.Setup(r => r.GetById(77)).ReturnsAsync(BuildTask(TaskStatuses.DONE));
        var useCase = new CreateSubtaskUseCase(_taskUpdate.Object, Guard(), _loggedUser.Object, _unitOfWork.Object, Mapper());

        await Assert.ThrowsAsync<ConflictException>(() => useCase.Execute(77, new RequestSubtaskJson { Title = "x" }));
    }

    [Fact]
    public async Task DeleteTask_ByMember_IsForbidden()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        var member = UserBuilder.Build(Roles.USER);
        GivenTeam(BuildTeam(leader, false, member));
        LoggedAs(member);
        _taskUpdate.Setup(r => r.GetById(77)).ReturnsAsync(BuildTask());
        var useCase = new DeleteTaskUseCase(_taskUpdate.Object, _taskWrite.Object, Guard(), _loggedUser.Object, _unitOfWork.Object);

        await Assert.ThrowsAsync<ForbiddenException>(() => useCase.Execute(77));
        _taskWrite.Verify(r => r.Delete(It.IsAny<long>()), Times.Never);
    }

    [Fact]
    public async Task DeleteComment_ByOtherMember_IsForbidden_ButAuthorIsAllowed()
    {
        var leader = UserBuilder.Build(Roles.LEADER);
        var author = UserBuilder.Build(Roles.USER);
        var other = UserBuilder.Build(Roles.USER);
        GivenTeam(BuildTeam(leader, false, author, other));

        var task = BuildTask();
        task.Comments.Add(new TaskComment { Id = 9, TaskId = 77, AuthorId = author.Id, Body = "oi" });
        _taskUpdate.Setup(r => r.GetById(77)).ReturnsAsync(task);

        LoggedAs(other);
        var denied = new DeleteCommentUseCase(_taskUpdate.Object, Guard(), _loggedUser.Object, _unitOfWork.Object);
        await Assert.ThrowsAsync<ForbiddenException>(() => denied.Execute(77, 9));

        LoggedAs(author);
        var allowed = new DeleteCommentUseCase(_taskUpdate.Object, Guard(), _loggedUser.Object, _unitOfWork.Object);
        await allowed.Execute(77, 9);

        Assert.Empty(task.Comments);
    }
}
