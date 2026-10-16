namespace Trilho.Application.UseCases.Teams.RemoveMember;
public interface IRemoveTeamMemberUseCase
{
    Task Execute(long teamId, long userId);
}
