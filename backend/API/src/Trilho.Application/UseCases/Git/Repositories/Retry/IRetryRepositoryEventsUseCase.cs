using Trilho.Communication.Responses.Git;

namespace Trilho.Application.UseCases.Git.Repositories.Retry;
public interface IRetryRepositoryEventsUseCase
{
    Task<ResponseGitRunJson> Execute(long id);
}
