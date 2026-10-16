using Trilho.Communication.Requests.Teams;

namespace Trilho.Application.UseCases.Teams.ChangeLeader;
public interface IChangeTeamLeaderUseCase
{
    Task Execute(long id, RequestChangeLeaderJson request);
}
