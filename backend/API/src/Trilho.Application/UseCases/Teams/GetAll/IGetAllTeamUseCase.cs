using Trilho.Communication.Responses.Teams;

namespace Trilho.Application.UseCases.Teams.GetAll;
public interface IGetAllTeamUseCase
{
    Task<ResponseTeamListJson> Execute(bool includeArchived = false);
}
