using Trilho.Domain.Entities;

namespace Trilho.Domain.Services.Prioritization;

public record RankedTask(TaskItem Task, string SuggestedPriority, string Justification);
public record AssigneeCandidate(long UserId, string Name, int OpenTasks);
public record AssigneeSuggestion(long UserId, string Name, int OpenTasks);

/// <summary>
/// Motor de priorização (RF07). A implementação atual é baseada em regras; outra estratégia
/// (ex: modelo de ML) entra como nova implementação, sem alterar os casos de uso.
/// </summary>
public interface IPrioritizationEngine
{
    /// <summary>Prioridade sugerida a partir do prazo.</summary>
    string SuggestPriority(DateOnly today, DateOnly? dueDate);

    /// <summary>Texto curto que explica a sugestão para a pessoa.</summary>
    string Justify(string suggestedPriority, DateOnly today, DateOnly? dueDate);

    /// <summary>
    /// Ordena as tarefas em aberto. Tarefas declaradas "urgent" ficam sempre no topo;
    /// depois a prioridade sugerida e, em empate, o prazo mais próximo.
    /// </summary>
    IReadOnlyList<RankedTask> Rank(
        IReadOnlyCollection<TaskItem> tasks,
        DateOnly today,
        IReadOnlyDictionary<long, int> openByAssignee,
        IReadOnlyDictionary<long, string> assigneeNames);

    /// <summary>Membro com menos tarefas em aberto (desempate: menor id), ou nulo sem candidatos.</summary>
    AssigneeSuggestion? SuggestAssignee(IReadOnlyCollection<AssigneeCandidate> candidates);
}
