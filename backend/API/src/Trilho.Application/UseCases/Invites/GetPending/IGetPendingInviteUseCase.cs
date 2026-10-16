using Trilho.Communication.Responses.Invites;

namespace Trilho.Application.UseCases.Invites.GetPending;
public interface IGetPendingInviteUseCase
{
    Task<List<ResponseInviteJson>> Execute();
}
