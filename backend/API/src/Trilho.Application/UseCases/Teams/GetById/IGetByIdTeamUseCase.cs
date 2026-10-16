using Trilho.Communication.Responses.Teams;

namespace Trilho.Application.UseCases.Teams.GetById;
public interface IGetByIdTeamUseCase
{
    Task<ResponseTeamJson> Execute(long id);
}
