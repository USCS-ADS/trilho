using Trilho.Communication.Requests.Invites;
using Trilho.Communication.Responses.Invites;

namespace Trilho.Application.UseCases.Invites.Create;
public interface ICreateInviteUseCase
{
    Task<ResponseInviteJson> Execute(RequestInviteJson request);
}
