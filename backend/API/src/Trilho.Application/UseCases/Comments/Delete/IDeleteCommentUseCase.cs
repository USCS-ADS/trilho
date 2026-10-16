namespace Trilho.Application.UseCases.Comments.Delete;
public interface IDeleteCommentUseCase
{
    Task Execute(long taskId, long commentId);
}
