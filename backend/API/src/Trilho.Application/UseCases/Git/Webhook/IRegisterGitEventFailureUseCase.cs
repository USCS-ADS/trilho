namespace Trilho.Application.UseCases.Git.Webhook;
public interface IRegisterGitEventFailureUseCase
{
    Task Execute(long pendingEventId, string error);
}
