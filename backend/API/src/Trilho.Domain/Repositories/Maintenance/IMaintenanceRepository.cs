namespace Trilho.Domain.Repositories.Maintenance;
/// <summary>Limpeza de dados vencidos. Cada método remove em lote e retorna quantos registros marcou para exclusão.</summary>
public interface IMaintenanceRepository
{
    Task<int> PurgeProcessedGitEvents(DateTime olderThan, int batchSize);
    Task<int> PurgeClosedPasswordResets(DateTime olderThan, int batchSize);
    Task<int> PurgeClosedInvites(DateTime olderThan, int batchSize);
}
