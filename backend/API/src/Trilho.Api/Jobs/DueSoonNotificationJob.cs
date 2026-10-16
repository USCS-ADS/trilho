using Trilho.Application.UseCases.Notifications.GenerateDueSoon;

namespace Trilho.Api.Jobs;
/// <summary>
/// Verifica periodicamente as tarefas com prazo próximo e gera o aviso ao responsável (RF08).
/// Intervalo em <c>Settings:Notifications:DueSoonCheckMinutes</c> (padrão 60).
/// </summary>
public class DueSoonNotificationJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DueSoonNotificationJob> _logger;
    private readonly TimeSpan _interval;

    public DueSoonNotificationJob(IServiceScopeFactory scopeFactory, ILogger<DueSoonNotificationJob> logger, IConfiguration configuration)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;

        var minutes = configuration.GetValue<int?>("Settings:Notifications:DueSoonCheckMinutes") ?? 60;
        _interval = TimeSpan.FromMinutes(Math.Max(1, minutes));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(_interval);

        do
        {
            await RunOnce(stoppingToken);
        }
        while (await WaitForNextTick(timer, stoppingToken));
    }

    private async Task RunOnce(CancellationToken stoppingToken)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var useCase = scope.ServiceProvider.GetRequiredService<IGenerateDueSoonNotificationsUseCase>();

            var created = await useCase.Execute();

            if (created > 0)
            {
                _logger.LogInformation("Avisos de prazo gerados: {Count}", created);
            }
        }
        catch (System.Exception exception) when (stoppingToken.IsCancellationRequested == false)
        {
            // O job não pode derrubar a API: registra e tenta de novo no próximo ciclo.
            _logger.LogError(exception, "Falha ao gerar avisos de prazo.");
        }
    }

    private static async Task<bool> WaitForNextTick(PeriodicTimer timer, CancellationToken stoppingToken)
    {
        try
        {
            return await timer.WaitForNextTickAsync(stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return false;
        }
    }
}
