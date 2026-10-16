using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Tasks;
public interface ITaskUpdateOnlyRepository
{
    /// <summary>Tarefa rastreada, com subtarefas e comentários carregados.</summary>
    Task<TaskItem?> GetById(long id);

    /// <summary>Tarefas rastreadas da coluna (time + status), ordenadas por posição.</summary>
    Task<List<TaskItem>> GetColumn(long teamId, string status);

    /// <summary>Tarefas rastreadas do time ainda não concluídas.</summary>
    Task<List<TaskItem>> GetOpenByTeam(long teamId);

    void Update(TaskItem task);
}
