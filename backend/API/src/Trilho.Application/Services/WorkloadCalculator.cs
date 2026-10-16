namespace Trilho.Application.Services;
/// <summary>Carga de trabalho (RF08): tarefas em aberto ÷ (membros × capacidade por membro) × 100.</summary>
public static class WorkloadCalculator
{
    public static int Capacity(int memberCount, int tasksPerMember) => memberCount * tasksPerMember;

    public static int Percent(int openTasks, int memberCount, int tasksPerMember)
    {
        var capacity = Capacity(memberCount, tasksPerMember);

        return capacity > 0 ? (int)Math.Round(100.0 * openTasks / capacity, MidpointRounding.AwayFromZero) : 0;
    }
}
