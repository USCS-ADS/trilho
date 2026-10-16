using Trilho.Communication.Responses.Tasks;

namespace Trilho.Application.UseCases.Tasks.GetBoard;
public interface IGetBoardTaskUseCase
{
    Task<ResponseTaskListJson> Execute(long? teamId, long? assigneeId, string? status, string? priority, int? page = null, int? pageSize = null);
}
