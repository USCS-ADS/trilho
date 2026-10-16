using Trilho.Communication.Requests.Teams;

namespace Trilho.Application.UseCases.Teams.Update;
public interface IUpdateTeamUseCase
{
    Task Execute(long id, RequestUpdateTeamJson request);
}
