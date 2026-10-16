namespace Trilho.Application.UseCases.Maintenance.PurgeOldData;

public record PurgeResult(int GitEvents, int PasswordResets, int Invites)
{
    public int Total => GitEvents + PasswordResets + Invites;
}

public interface IPurgeOldDataUseCase
{
    Task<PurgeResult> Execute();
}
