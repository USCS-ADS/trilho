namespace Trilho.Application.UseCases.Shared;
public static class Paging
{
    /// <summary>Normaliza página (a partir de 1) e tamanho: valores ausentes/inválidos viram o padrão e o tamanho respeita o máximo.</summary>
    public static (int Page, int PageSize) Normalize(int? page, int? pageSize, int defaultSize, int maxSize)
    {
        var normalizedPage = page is > 0 ? page.Value : 1;
        var normalizedSize = pageSize is > 0 ? Math.Min(pageSize.Value, maxSize) : defaultSize;

        return (normalizedPage, normalizedSize);
    }
}
