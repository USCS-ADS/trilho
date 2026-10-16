using Trilho.Communication.Requests.Tasks;
using Trilho.Communication.Responses.Tasks;

namespace Trilho.Application.UseCases.Tasks.Create;
public interface ICreateTaskUseCase
{
    Task<ResponseTaskJson> Execute(RequestTaskJson request);
}
