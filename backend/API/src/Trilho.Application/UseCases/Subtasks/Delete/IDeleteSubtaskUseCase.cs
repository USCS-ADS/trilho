namespace Trilho.Application.UseCases.Subtasks.Delete;
public interface IDeleteSubtaskUseCase
{
    Task Execute(long taskId, long subtaskId);
}
