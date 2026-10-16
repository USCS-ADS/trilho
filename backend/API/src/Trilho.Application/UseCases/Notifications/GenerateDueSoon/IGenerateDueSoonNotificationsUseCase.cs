namespace Trilho.Application.UseCases.Notifications.GenerateDueSoon;
public interface IGenerateDueSoonNotificationsUseCase
{
    /// <summary>Cria os avisos de prazo próximo ainda não gerados. Retorna quantos foram criados.</summary>
    Task<int> Execute();
}
