using Trilho.Communication.Responses.Users;

namespace Trilho.Application.UseCases.Users.GetAll;
public interface IGetAllUserUseCase
{
    Task<ResponseUserListJson> Execute();
}
