namespace Trilho.Domain.Repositories.Dashboard;
/// <summary>Consultas agregadas do dashboard. <c>teamIds</c> nulo = todos os times.</summary>
public interface IDashboardReadOnlyRepository
{
    Task<Dictionary<string, int>> CountTasksByStatus(IReadOnlyCollection<long>? teamIds);

    /// <summary>Tarefas com prazo vencido (antes de <paramref name="today"/>) e ainda não concluídas.</summary>
    Task<int> CountOverdueTasks(IReadOnlyCollection<long>? teamIds, DateOnly today);

    /// <summary>Times ativos (não arquivados) com membros e tarefas em aberto.</summary>
    Task<List<TeamLoad>> GetTeamLoads(IReadOnlyCollection<long>? teamIds);

    /// <summary>Tarefas concluídas por dia (data UTC de conclusão) desde <paramref name="since"/>.</summary>
    Task<Dictionary<DateOnly, int>> CountCompletedPerDay(IReadOnlyCollection<long>? teamIds, DateTime since);
}
