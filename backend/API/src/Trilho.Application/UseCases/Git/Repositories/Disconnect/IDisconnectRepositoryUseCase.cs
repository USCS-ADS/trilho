namespace Trilho.Application.UseCases.Git.Repositories.Disconnect;
public interface IDisconnectRepositoryUseCase
{
    Task Execute(long id);
}
