using Trilho.Domain.Repositories;
using Trilho.Domain.Repositories.Maintenance;
using Trilho.Domain.Services.Settings;

namespace Trilho.Application.UseCases.Maintenance.PurgeOldData;
/// <summary>
/// Retenção: remove eventos Git já processados e tokens/convites vencidos, para o banco não crescer sem limite.
/// Opera em lotes; o job chama de novo no próximo ciclo se ainda houver resíduo.
/// </summary>
public class PurgeOldDataUseCase : IPurgeOldDataUseCase
{
    private const int BatchSize = 500;

    private readonly IMaintenanceRepository _repository;
    private readonly IRetentionSettings _settings;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _timeProvider;

    public PurgeOldDataUseCase(IMaintenanceRepository repository, IRetentionSettings settings, IUnitOfWork unitOfWork, TimeProvider timeProvider)
    {
        _repository = repository;
        _settings = settings;
        _unitOfWork = unitOfWork;
        _timeProvider = timeProvider;
    }

    public async Task<PurgeResult> Execute()
    {
        var now = _timeProvider.GetUtcNow().UtcDateTime;

        var gitEvents = await _repository.PurgeProcessedGitEvents(now.AddDays(-_settings.GitEventsDays), BatchSize);
        var resets = await _repository.PurgeClosedPasswordResets(now.AddDays(-_settings.AuthFlowDays), BatchSize);
        var invites = await _repository.PurgeClosedInvites(now.AddDays(-_settings.AuthFlowDays), BatchSize);

        var result = new PurgeResult(gitEvents, resets, invites);

        if (result.Total > 0)
        {
            await _unitOfWork.Commit();
        }

        return result;
    }
}
