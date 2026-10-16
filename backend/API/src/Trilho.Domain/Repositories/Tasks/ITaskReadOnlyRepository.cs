using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Tasks;
public interface ITaskReadOnlyRepository
{
    /// <summary>Tarefas do quadro, ordenadas por coluna/posição, com subtarefas e comentários (contagens).</summary>
    Task<PagedResult<TaskItem>> GetBoard(TaskFilter filter);

    /// <summary>Detalhe com subtarefas e comentários (com autor).</summary>
    Task<TaskItem?> GetById(long id);

    Task<List<TaskActivity>> GetActivity(long taskId);

    /// <summary>Próxima posição livre no fim da coluna.</summary>
    Task<int> GetNextPosition(long teamId, string status);

    Task<bool> ExistsForTeam(long teamId);

    /// <summary>Tarefas com responsável, não concluídas, com prazo entre as datas (inclusive).</summary>
    Task<List<TaskItem>> GetDueSoon(DateOnly from, DateOnly to);

    /// <summary>Tarefas não concluídas por responsável (em todos os times), para os usuários informados.</summary>
    Task<Dictionary<long, int>> CountOpenByAssignee(IReadOnlyCollection<long> userIds);
}
