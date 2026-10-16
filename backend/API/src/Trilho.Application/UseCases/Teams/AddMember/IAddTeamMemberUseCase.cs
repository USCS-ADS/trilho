using Trilho.Communication.Requests.Teams;

namespace Trilho.Application.UseCases.Teams.AddMember;
public interface IAddTeamMemberUseCase
{
    Task Execute(long teamId, RequestTeamMemberJson request);
}
