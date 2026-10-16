using Trilho.Communication.Requests.Invites;
using Trilho.Communication.Responses.Users;

namespace Trilho.Application.UseCases.Invites.Accept;
public interface IAcceptInviteUseCase
{
    Task<ResponseUserJson> Execute(RequestAcceptInviteJson request);
}
