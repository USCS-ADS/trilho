namespace Trilho.Application.UseCases.Git.Webhook;
public interface IProcessGitEventUseCase
{
    Task Execute(long pendingEventId);
}
