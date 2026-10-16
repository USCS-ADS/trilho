using Trilho.Application.Services;
using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Services.Prioritization;

namespace UseCases.Test.Prioritization;
public class RuleBasedPrioritizationEngineTests
{
    private static readonly DateOnly Today = new(2026, 10, 15);
    private readonly RuleBasedPrioritizationEngine _engine = new();

    private static readonly IReadOnlyDictionary<long, int> NoLoad = new Dictionary<long, int>();
    private static readonly IReadOnlyDictionary<long, string> NoNames = new Dictionary<long, string>();

    private static TaskItem Task(long id, string priority, DateOnly? due = null, string status = TaskStatuses.TODO, long? assignee = null)
        => new() { Id = id, Title = $"T{id}", Priority = priority, DueDate = due, Status = status, AssigneeId = assignee };

    [Theory]
    [InlineData(-1, TaskPriorities.URGENT)]
    [InlineData(0, TaskPriorities.HIGH)]
    [InlineData(7, TaskPriorities.HIGH)]
    [InlineData(8, TaskPriorities.MEDIUM)]
    [InlineData(21, TaskPriorities.MEDIUM)]
    [InlineData(22, TaskPriorities.LOW)]
    public void SuggestPriority_FollowsDeadlineRules(int daysFromToday, string expected)
    {
        Assert.Equal(expected, _engine.SuggestPriority(Today, Today.AddDays(daysFromToday)));
    }

    [Fact]
    public void SuggestPriority_WithoutDeadline_IsMedium()
    {
        Assert.Equal(TaskPriorities.MEDIUM, _engine.SuggestPriority(Today, null));
    }

    [Fact]
    public void Rank_DeclaredUrgentAlwaysOnTop_EvenWithFarDeadline()
    {
        var tasks = new[]
        {
            Task(1, TaskPriorities.LOW, Today.AddDays(-5)),     // sugerida urgente por prazo vencido
            Task(2, TaskPriorities.URGENT, Today.AddDays(60)),  // declarada urgente, prazo distante
            Task(3, TaskPriorities.MEDIUM, Today.AddDays(3))
        };

        var ranking = _engine.Rank(tasks, Today, NoLoad, NoNames);

        Assert.Equal([2L, 1L, 3L], ranking.Select(r => r.Task.Id).ToArray());
        Assert.Equal(TaskPriorities.URGENT, ranking[0].SuggestedPriority);
    }

    [Fact]
    public void Rank_TiesBrokenByNearestDeadline_AndTasksWithoutDeadlineLast()
    {
        var tasks = new[]
        {
            Task(1, TaskPriorities.MEDIUM, Today.AddDays(5)),
            Task(2, TaskPriorities.MEDIUM, Today.AddDays(2)),
            Task(3, TaskPriorities.MEDIUM, null)
        };

        var ranking = _engine.Rank(tasks, Today, NoLoad, NoNames);

        // 1 e 2 são "alta" (≤ 7 dias); a sem prazo é "média" e vem depois.
        Assert.Equal([2L, 1L, 3L], ranking.Select(r => r.Task.Id).ToArray());
    }

    [Fact]
    public void Rank_IgnoresDoneTasks()
    {
        var tasks = new[] { Task(1, TaskPriorities.HIGH, status: TaskStatuses.DONE), Task(2, TaskPriorities.LOW) };

        var ranking = _engine.Rank(tasks, Today, NoLoad, NoNames);

        Assert.Single(ranking);
        Assert.Equal(2, ranking[0].Task.Id);
    }

    [Fact]
    public void Rank_Justification_MentionsAssigneeLoadAndDeadline()
    {
        var tasks = new[] { Task(1, TaskPriorities.MEDIUM, Today.AddDays(1), assignee: 9) };
        var load = new Dictionary<long, int> { [9] = 4 };
        var names = new Dictionary<long, string> { [9] = "Ana Luiza" };

        var ranking = _engine.Rank(tasks, Today, load, names);

        Assert.Equal("Ana tem 4 tarefas em aberto e prazo em 1 dia.", ranking[0].Justification);
    }

    [Fact]
    public void Rank_Justification_ForDeclaredUrgent_ExplainsLeadershipChoice()
    {
        var ranking = _engine.Rank([Task(1, TaskPriorities.URGENT)], Today, NoLoad, NoNames);

        Assert.Contains("urgente", ranking[0].Justification);
    }

    [Fact]
    public void SuggestAssignee_PicksFewestOpenTasks_TieBreaksByLowestId()
    {
        var suggestion = _engine.SuggestAssignee(
        [
            new AssigneeCandidate(5, "Carlos", 3),
            new AssigneeCandidate(2, "Bia", 1),
            new AssigneeCandidate(3, "Davi", 1)
        ]);

        Assert.Equal(2, suggestion!.UserId);
    }

    [Fact]
    public void SuggestAssignee_WithoutCandidates_IsNull()
    {
        Assert.Null(_engine.SuggestAssignee([]));
    }
}
