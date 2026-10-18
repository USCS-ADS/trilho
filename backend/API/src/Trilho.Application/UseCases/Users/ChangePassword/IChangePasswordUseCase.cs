using Trilho.Communication.Requests.Users;
using Trilho.Communication.Responses.Users;

namespace Trilho.Application.UseCases.Users.ChangePassword;
public interface IChangePasswordUseCase
{
    /// <summary>Troca a senha e devolve um token novo: as demais sessões caem, a atual continua.</summary>
    Task<ResponseUserLoginJson> Execute(RequestChangePasswordJson request);
}
