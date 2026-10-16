using Trilho.Communication.Requests.Invites;
using Trilho.Communication.Responses.Invites;

namespace Trilho.Application.UseCases.Invites.Lookup;
public interface ILookupInviteUseCase
{
    Task<ResponseInviteLookupJson> Execute(RequestInviteTokenJson request);
}
