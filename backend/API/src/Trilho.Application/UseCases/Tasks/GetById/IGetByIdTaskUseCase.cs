using Trilho.Communication.Responses.Tasks;

namespace Trilho.Application.UseCases.Tasks.GetById;
public interface IGetByIdTaskUseCase
{
    Task<ResponseTaskJson> Execute(long id);
}
