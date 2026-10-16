namespace Trilho.Application.UseCases.Git.Shared;
/// <summary>
/// Executa o processamento de eventos Git, cada um em um escopo próprio. O isolamento garante
/// que a falha de um evento não "suja" o contexto do banco nem impede os demais.
/// </summary>
public interface IGitEventRunner
{
    /// <summary>Processa um evento. Retorna verdadeiro se concluiu; em caso de erro, registra a falha na fila.</summary>
    Task<bool> Run(long pendingEventId);

    /// <summary>Processa os eventos pendentes (de um repositório ou de todos).</summary>
    Task<(int Processed, int Failed)> RunPending(long? repositoryId);
}
