namespace Trilho.Domain.Repositories.Tasks;
/// <summary>Filtros do quadro Kanban. <c>TeamIds</c> nulo = sem restrição de time (administrador).</summary>
public record TaskFilter(
    IReadOnlyCollection<long>? TeamIds = null,
    long? AssigneeId = null,
    string? Status = null,
    string? Priority = null,
    int? Page = null,
    int? PageSize = null);
