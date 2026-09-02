using Trilho.Communication.Responses.Users;

namespace Trilho.Application.UseCases.Users.GetById;
public interface IGetByIdUserUseCase
{
    Task<ResponseUserJson> Execute(long id);
}
