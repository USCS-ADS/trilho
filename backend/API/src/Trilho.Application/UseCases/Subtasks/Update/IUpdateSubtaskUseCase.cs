using Trilho.Communication.Requests.Tasks;

namespace Trilho.Application.UseCases.Subtasks.Update;
public interface IUpdateSubtaskUseCase
{
    Task Execute(long taskId, long subtaskId, RequestUpdateSubtaskJson request);
}
