using Trilho.Application.UseCases.Maintenance.PurgeOldData;

namespace Trilho.Api.Jobs;
/// <summary>Executa a limpeza de dados vencidos (retenção) periodicamente. Intervalo: <c>Settings:Retention:IntervalHours</c> (padrão 24).</summary>
public class DataRetentionJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DataRetentionJob> _logger;
    private readonly TimeSpan _interval;

    public DataRetentionJob(IServiceScopeFactory scopeFactory, ILogger<DataRetentionJob> logger, IConfiguration configuration)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;

        var hours = configuration.GetValue<int?>("Settings:Retention:IntervalHours") ?? 24;
        _interval = TimeSpan.FromHours(Math.Max(1, hours));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(_interval);

        try
        {
            do
            {
                await RunOnce(stoppingToken);
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }
        catch (OperationCanceledException)
        {
            // Encerramento normal da aplicação.
        }
    }

    private async Task RunOnce(CancellationToken stoppingToken)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var useCase = scope.ServiceProvider.GetRequiredService<IPurgeOldDataUseCase>();

            var result = await useCase.Execute();

            if (result.Total > 0)
            {
                _logger.LogInformation(
                    "Retenção: removidos {GitEvents} eventos Git, {Resets} pedidos de redefinição e {Invites} convites.",
                    result.GitEvents, result.PasswordResets, result.Invites);
            }
        }
        catch (System.Exception exception) when (stoppingToken.IsCancellationRequested == false)
        {
            _logger.LogError(exception, "Falha na limpeza de dados vencidos.");
        }
    }
}
