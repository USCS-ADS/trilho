using Trilho.Communication.Responses.Users;

namespace Trilho.Application.UseCases.Users.Profile;
public interface IGetProfileUseCase
{
    Task<ResponseUserJson> Execute();
}
