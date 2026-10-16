using Trilho.Domain.Entities;
using Trilho.Domain.Enum;
using Trilho.Domain.Services.Prioritization;

namespace Trilho.Application.Services;
/// <summary>
/// Priorização por regras (determinística e explicável):
/// prazo vencido → urgent; até 7 dias → high; até 21 → medium; depois → low; sem prazo → medium.
/// </summary>
public class RuleBasedPrioritizationEngine : IPrioritizationEngine
{
    private const int HighWithinDays = 7;
    private const int MediumWithinDays = 21;

    private static readonly Dictionary<string, int> Order = new()
    {
        [TaskPriorities.URGENT] = 0,
        [TaskPriorities.HIGH] = 1,
        [TaskPriorities.MEDIUM] = 2,
        [TaskPriorities.LOW] = 3
    };

    public string SuggestPriority(DateOnly today, DateOnly? dueDate)
    {
        if (dueDate is null)
        {
            return TaskPriorities.MEDIUM;
        }

        var daysLeft = dueDate.Value.DayNumber - today.DayNumber;

        if (daysLeft < 0)
        {
            return TaskPriorities.URGENT;
        }

        if (daysLeft <= HighWithinDays)
        {
            return TaskPriorities.HIGH;
        }

        return daysLeft <= MediumWithinDays ? TaskPriorities.MEDIUM : TaskPriorities.LOW;
    }

    public string Justify(string suggestedPriority, DateOnly today, DateOnly? dueDate)
    {
        var deadline = DescribeDeadline(today, dueDate);

        return $"{char.ToUpperInvariant(deadline[0])}{deadline[1..]}: prioridade sugerida {PriorityLabel(suggestedPriority)}.";
    }

    public IReadOnlyList<RankedTask> Rank(
        IReadOnlyCollection<TaskItem> tasks,
        DateOnly today,
        IReadOnlyDictionary<long, int> openByAssignee,
        IReadOnlyDictionary<long, string> assigneeNames)
    {
        return tasks
            .Where(task => task.Status != TaskStatuses.DONE)
            .Select(task =>
            {
                var declaredUrgent = task.Priority == TaskPriorities.URGENT;
                var suggested = declaredUrgent ? TaskPriorities.URGENT : SuggestPriority(today, task.DueDate);

                return new RankedTask(task, suggested, BuildJustification(task, declaredUrgent, suggested, today, openByAssignee, assigneeNames));
            })
            .OrderByDescending(ranked => ranked.Task.Priority == TaskPriorities.URGENT)
            .ThenBy(ranked => Order[ranked.SuggestedPriority])
            .ThenBy(ranked => ranked.Task.DueDate ?? DateOnly.MaxValue)
            .ThenBy(ranked => ranked.Task.Id)
            .ToList();
    }

    public AssigneeSuggestion? SuggestAssignee(IReadOnlyCollection<AssigneeCandidate> candidates)
    {
        var best = candidates.OrderBy(candidate => candidate.OpenTasks).ThenBy(candidate => candidate.UserId).FirstOrDefault();

        return best is null ? null : new AssigneeSuggestion(best.UserId, best.Name, best.OpenTasks);
    }

    private string BuildJustification(
        TaskItem task,
        bool declaredUrgent,
        string suggested,
        DateOnly today,
        IReadOnlyDictionary<long, int> openByAssignee,
        IReadOnlyDictionary<long, string> assigneeNames)
    {
        if (declaredUrgent)
        {
            return "Marcada como urgente pela liderança; permanece no topo da lista.";
        }

        var deadline = DescribeDeadline(today, task.DueDate);

        if (task.AssigneeId is not null && assigneeNames.TryGetValue(task.AssigneeId.Value, out var name))
        {
            var firstName = name.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? name;
            var open = openByAssignee.GetValueOrDefault(task.AssigneeId.Value);

            return $"{firstName} tem {Plural(open, "tarefa", "tarefas")} em aberto e {deadline}.";
        }

        return $"{char.ToUpperInvariant(deadline[0])}{deadline[1..]}.";
    }

    private static string DescribeDeadline(DateOnly today, DateOnly? dueDate)
    {
        if (dueDate is null)
        {
            return "sem prazo definido";
        }

        var daysLeft = dueDate.Value.DayNumber - today.DayNumber;

        if (daysLeft < 0)
        {
            return $"prazo vencido há {Plural(-daysLeft, "dia", "dias")}";
        }

        return daysLeft == 0 ? "prazo vence hoje" : $"prazo em {Plural(daysLeft, "dia", "dias")}";
    }

    private static string Plural(int count, string singular, string plural) => $"{count} {(count == 1 ? singular : plural)}";

    private static string PriorityLabel(string priority) => priority switch
    {
        TaskPriorities.URGENT => "Urgente",
        TaskPriorities.HIGH => "Alta",
        TaskPriorities.MEDIUM => "Média",
        _ => "Baixa"
    };
}
