using Microsoft.Extensions.DependencyInjection;
using Trilho.Application.UseCases.Git.Webhook;
using Trilho.Domain.Repositories.Git;
using Trilho.Domain.Services.Settings;

namespace Trilho.Application.UseCases.Git.Shared;
public class GitEventRunner : IGitEventRunner
{
    private readonly IServiceScopeFactory _scopeFactory;

    public GitEventRunner(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public async Task<bool> Run(long pendingEventId)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var useCase = scope.ServiceProvider.GetRequiredService<IProcessGitEventUseCase>();

            await useCase.Execute(pendingEventId);

            return true;
        }
        catch (System.Exception exception)
        {
            await using var failureScope = _scopeFactory.CreateAsyncScope();
            var failure = failureScope.ServiceProvider.GetRequiredService<IRegisterGitEventFailureUseCase>();

            await failure.Execute(pendingEventId, exception.Message);

            return false;
        }
    }

    public async Task<(int Processed, int Failed)> RunPending(long? repositoryId)
    {
        List<long> ids;

        await using (var scope = _scopeFactory.CreateAsyncScope())
        {
            var repository = scope.ServiceProvider.GetRequiredService<IPendingGitEventUpdateOnlyRepository>();
            var settings = scope.ServiceProvider.GetRequiredService<IGitSettings>();

            ids = await repository.GetPendingIds(repositoryId, settings.MaxAttempts);
        }

        var processed = 0;
        var failed = 0;

        foreach (var id in ids)
        {
            if (await Run(id))
            {
                processed++;
            }
            else
            {
                failed++;
            }
        }

        return (processed, failed);
    }
}
