using Trilho.Communication.Requests.Teams;
using Trilho.Communication.Responses.Teams;

namespace Trilho.Application.UseCases.Teams.Create;
public interface ICreateTeamUseCase
{
    Task<ResponseTeamJson> Execute(RequestTeamJson request);
}
