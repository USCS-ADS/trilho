using Trilho.Communication.Responses.Tasks;

namespace Trilho.Application.UseCases.Tasks.GetActivity;
public interface IGetTaskActivityUseCase
{
    Task<List<ResponseActivityJson>> Execute(long taskId);
}
