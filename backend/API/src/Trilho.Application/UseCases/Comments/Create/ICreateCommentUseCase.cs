using Trilho.Communication.Requests.Tasks;
using Trilho.Communication.Responses.Tasks;

namespace Trilho.Application.UseCases.Comments.Create;
public interface ICreateCommentUseCase
{
    Task<ResponseCommentJson> Execute(long taskId, RequestCommentJson request);
}
