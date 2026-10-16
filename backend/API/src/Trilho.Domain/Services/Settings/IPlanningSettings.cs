namespace Trilho.Domain.Services.Settings;
/// <summary>Parâmetros de planejamento: carga de trabalho, sprints e avisos de prazo.</summary>
public interface IPlanningSettings
{
    /// <summary>Capacidade estimada de tarefas em aberto por membro (premissa configurável).</summary>
    int TasksPerMember { get; }

    /// <summary>Carga acima deste percentual dispara o alerta de sobrecarga.</summary>
    int AlertThresholdPercent { get; }

    int SprintLengthDays { get; }

    /// <summary>Primeiro dia do primeiro sprint; os sprints seguintes são janelas consecutivas.</summary>
    DateOnly SprintAnchorDate { get; }

    /// <summary>Antecedência (horas) do aviso de prazo.</summary>
    int DueSoonHours { get; }
}
