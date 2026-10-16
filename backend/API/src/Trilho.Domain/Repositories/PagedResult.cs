namespace Trilho.Domain.Repositories;
/// <summary>Página de resultados com o total geral (antes da paginação).</summary>
public record PagedResult<T>(List<T> Items, int TotalCount);
