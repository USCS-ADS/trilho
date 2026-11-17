import type { DashboardData } from "@/app/lib/dashboard/types";

interface Stat {
    label: string;
    value: number;
    tone: string;
}

/** Só mostra os indicadores que o usuário pode ver (membro não tem concluídas/atrasadas do consolidado). */
function buildStats(data: DashboardData): Stat[] {
    const stats: Stat[] = [{ label: "Tarefas ativas", value: data.activeTasks, tone: "text-trilho-text" }];

    if (data.completedInCurrentSprint !== undefined) {
        stats.push({
            label: "Concluídas na sprint",
            value: data.completedInCurrentSprint,
            tone: "text-trilho-success",
        });
    }

    if (data.overdueTasks !== undefined) {
        stats.push({ label: "Tarefas atrasadas", value: data.overdueTasks, tone: "text-trilho-danger" });
    }

    stats.push({ label: "Times ativos", value: data.activeTeams, tone: "text-trilho-text" });

    return stats;
}

export function StatsSummary({ data }: { data: DashboardData }) {
    const stats = buildStats(data);

    return (
        <div className={`grid grid-cols-2 gap-4 ${stats.length > 2 ? "sm:grid-cols-4" : "sm:grid-cols-2"}`}>
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="rounded-xl border border-trilho-border bg-trilho-surface p-4"
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-trilho-dim">
                        {stat.label}
                    </p>
                    <p className={`mt-2 text-2xl font-semibold ${stat.tone}`}>{stat.value}</p>
                </div>
            ))}
        </div>
    );
}
