using Trilho.Communication.Responses.Git;

namespace Trilho.Application.UseCases.Git.Repositories.GetAll;
public interface IGetAllRepositoriesUseCase
{
    Task<List<ResponseGitRepositoryJson>> Execute();
}
