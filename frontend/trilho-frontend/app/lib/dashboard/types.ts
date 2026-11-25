/** Dados já prontos para as telas do dashboard (vêm da API ou, em demonstração, de valores fictícios). */
export interface DashboardData {
    activeTasks: number;
    activeTeams: number;
    /** Ausentes para quem não pode ver o consolidado (membro). */
    completedInCurrentSprint?: number;
    overdueTasks?: number;
    thresholdPercent: number;
    workloads: { id: string; name: string; percent: number }[];
    sprints?: { label: string; completed: number; isCurrent: boolean }[];
}
