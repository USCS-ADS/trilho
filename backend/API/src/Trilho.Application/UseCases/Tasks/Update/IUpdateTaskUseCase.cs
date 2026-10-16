using Trilho.Communication.Requests.Tasks;

namespace Trilho.Application.UseCases.Tasks.Update;
public interface IUpdateTaskUseCase
{
    Task Execute(long id, RequestUpdateTaskJson request);
}
