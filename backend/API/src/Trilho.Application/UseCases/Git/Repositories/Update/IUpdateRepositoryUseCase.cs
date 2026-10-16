using Trilho.Communication.Requests.Git;

namespace Trilho.Application.UseCases.Git.Repositories.Update;
public interface IUpdateRepositoryUseCase
{
    Task Execute(long id, RequestUpdateRepositoryJson request);
}
