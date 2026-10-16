namespace Trilho.Domain.Services.Settings;
public interface IRetentionSettings
{
    /// <summary>Dias de retenção dos eventos Git já processados.</summary>
    int GitEventsDays { get; }

    /// <summary>Dias de retenção de convites encerrados e pedidos de redefinição usados/expirados.</summary>
    int AuthFlowDays { get; }
}
