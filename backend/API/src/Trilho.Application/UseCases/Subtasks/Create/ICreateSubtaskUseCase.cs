using Trilho.Communication.Requests.Tasks;
using Trilho.Communication.Responses.Tasks;

namespace Trilho.Application.UseCases.Subtasks.Create;
public interface ICreateSubtaskUseCase
{
    Task<ResponseSubtaskJson> Execute(long taskId, RequestSubtaskJson request);
}
