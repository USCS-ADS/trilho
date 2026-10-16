using Trilho.Domain.Entities;

namespace Trilho.Domain.Repositories.Tasks;
public interface ITaskWriteOnlyRepository
{
    Task Create(TaskItem task);
    Task<bool> Delete(long id);
}
