using Trilho.Application.UseCases.Git.Shared;

namespace Trilho.Api.Jobs;
/// <summary>
/// Reprocessa periodicamente os eventos Git que falharam (RF06). Intervalo em
/// <c>Settings:Git:RetryIntervalSeconds</c> (padrão 60); cada evento tem um limite de tentativas.
/// </summary>
public class GitEventRetryJob : BackgroundService
{
    private readonly IGitEventRunner _runner;
    private readonly ILogger<GitEventRetryJob> _logger;
    private readonly TimeSpan _interval;

    public GitEventRetryJob(IGitEventRunner runner, ILogger<GitEventRetryJob> logger, IConfiguration configuration)
    {
        _runner = runner;
        _logger = logger;

        var seconds = configuration.GetValue<int?>("Settings:Git:RetryIntervalSeconds") ?? 60;
        _interval = TimeSpan.FromSeconds(Math.Max(5, seconds));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(_interval);

        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await RunOnce(stoppingToken);
            }
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
            var (processed, failed) = await _runner.RunPending(null);

            if (processed > 0 || failed > 0)
            {
                _logger.LogInformation("Eventos Git reprocessados: {Processed} ok, {Failed} com falha", processed, failed);
            }
        }
        catch (System.Exception exception) when (stoppingToken.IsCancellationRequested == false)
        {
            _logger.LogError(exception, "Falha ao reprocessar eventos Git.");
        }
    }
}
