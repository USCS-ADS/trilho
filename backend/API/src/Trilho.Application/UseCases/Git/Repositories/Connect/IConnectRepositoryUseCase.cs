using Trilho.Communication.Requests.Git;
using Trilho.Communication.Responses.Git;

namespace Trilho.Application.UseCases.Git.Repositories.Connect;
public interface IConnectRepositoryUseCase
{
    Task<ResponseGitRepositoryCreatedJson> Execute(RequestConnectRepositoryJson request);
}
