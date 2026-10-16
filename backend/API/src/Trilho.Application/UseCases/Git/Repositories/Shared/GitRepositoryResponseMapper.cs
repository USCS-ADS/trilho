using Trilho.Communication.Responses.Git;
using Trilho.Domain.Entities;
using Trilho.Domain.Services.Settings;

namespace Trilho.Application.UseCases.Git.Repositories.Shared;
internal static class GitRepositoryResponseMapper
{
    public static T ToResponse<T>(this GitRepository repository, IGitSettings settings, int pendingEvents = 0)
        where T : ResponseGitRepositoryJson, new()
    {
        return new T
        {
            Id = repository.Id,
            Provider = repository.Provider,
            FullName = repository.FullName,
            TeamId = repository.TeamId,
            Status = repository.Status,
            LastSyncAt = repository.LastSyncAt,
            Events = repository.EventList.ToList(),
            PendingEvents = pendingEvents,
            WebhookUrl = settings.BuildWebhookUrl(repository.Id),
            CreatedAt = repository.CreatedAt
        };
    }
}
