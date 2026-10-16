using Trilho.Communication.Requests.Tasks;

namespace Trilho.Application.UseCases.Tasks.Move;
public interface IMoveTaskUseCase
{
    Task Execute(long id, RequestMoveTaskJson request);
}
