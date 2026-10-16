using CommonTestUtilities.Entities;
using Moq;
using Trilho.Application.UseCases.Dashboard.Shared;
using Trilho.Application.UseCases.Notifications.GenerateDueSoon;
using Trilho.Application.UseCases.Notifications.Shared;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Notifications;
using Trilho.Domain.Repositories.Tasks;
using Trilho.Domain.Services.Settings;

namespace UseCases.Test.Dashboard;
public class SprintAndNotificationTests
{
    private static readonly DateOnly Anchor = new(2026, 8, 3);

    // ---- SprintCalendar

    [Theory]
    [InlineData(2026, 8, 3, 0)]
    [InlineData(2026, 8, 16, 0)]
    [InlineData(2026, 8, 17, 1)]
    [InlineData(2026, 10, 15, 5)]
    [InlineData(2026, 8, 2, -1)]
    [InlineData(2026, 7, 20, -1)]
    [InlineData(2026, 7, 19, -2)]
    public void IndexOf_UsesConsecutiveWindowsFromAnchor(int year, int month, int day, int expected)
    {
        Assert.Equal(expected, SprintCalendar.IndexOf(new DateOnly(year, month, day), Anchor, 14));
    }

    [Fact]
    public void RangeOf_ReturnsInclusiveWindow()
    {
        var (start, end) = SprintCalendar.RangeOf(1, Anchor, 14);

        Assert.Equal(new DateOnly(2026, 8, 17), start);
        Assert.Equal(new DateOnly(2026, 8, 30), end);
    }

    // ---- TaskNotifier

    [Fact]
    public async Task Notifier_SelfAssignment_DoesNotNotify()
    {
        var repository = new Mock<INotificationWriteOnlyRepository>();
        var notifier = new TaskNotifier(repository.Object);

        await notifier.Assigned(new TaskItem { Title = "T" }, recipientId: 7, actorId: 7);

        repository.Verify(r => r.Create(It.IsAny<Notification>()), Times.Never);
    }

    [Fact]
    public async Task Notifier_StatusChange_NotifiesAssigneeAndCreator_ButNotTheActor()
    {
        var created = new List<Notification>();
        var repository = new Mock<INotificationWriteOnlyRepository>();
        repository.Setup(r => r.Create(It.IsAny<Notification>())).Callback<Notification>(created.Add).Returns(Task.CompletedTask);
        var notifier = new TaskNotifier(repository.Object);

        var task = new TaskItem { Title = "Deploy", AssigneeId = 1, CreatedById = 2 };

        await notifier.StatusChanged(task, TaskStatuses.TODO, TaskStatuses.DONE, actorId: 2);

        var only = Assert.Single(created);
        Assert.Equal(1, only.UserId);
        Assert.Equal(NotificationTypes.TASK_STATUS_CHANGED, only.Type);
        Assert.Contains("Concluído", only.Message);
    }

    // ---- GenerateDueSoon

    [Fact]
    public async Task DueSoon_CreatesOncePerTaskAndDueDate()
    {
        var assignee = UserBuilder.Build();
        var task = new TaskItem { Id = 5, Title = "Entrega", AssigneeId = assignee.Id, DueDate = new DateOnly(2026, 10, 16) };

        var tasks = new Mock<ITaskReadOnlyRepository>();
        tasks.Setup(r => r.GetDueSoon(It.IsAny<DateOnly>(), It.IsAny<DateOnly>())).ReturnsAsync([task]);

        var read = new Mock<INotificationReadOnlyRepository>();
        var write = new Mock<INotificationWriteOnlyRepository>();
        var unitOfWork = new Mock<IUnitOfWork>();

        var settings = new Mock<IPlanningSettings>();
        settings.SetupGet(s => s.DueSoonHours).Returns(48);

        var useCase = new GenerateDueSoonNotificationsUseCase(tasks.Object, read.Object, write.Object, settings.Object, unitOfWork.Object, TimeProvider.System);

        var first = await useCase.Execute();
        Assert.Equal(1, first);
        write.Verify(r => r.Create(It.Is<Notification>(n => n.DedupKey == "due-soon:5:2026-10-16" && n.UserId == assignee.Id)), Times.Once);

        // Já existe aviso com a mesma chave: nada novo.
        read.Setup(r => r.ExistsWithDedupKey(assignee.Id, "due-soon:5:2026-10-16")).ReturnsAsync(true);
        var second = await useCase.Execute();

        Assert.Equal(0, second);
        write.Verify(r => r.Create(It.IsAny<Notification>()), Times.Once);
    }
}
