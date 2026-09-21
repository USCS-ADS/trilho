// TODO: substituir por dados reais da API (contagem de tarefas/times).
const STATS = [
    { label: "Tarefas ativas", value: 21, tone: "text-trilho-text" },
    { label: "Concluídas na sprint", value: 34, tone: "text-trilho-success" },
    { label: "Tarefas atrasadas", value: 3, tone: "text-trilho-danger" },
    { label: "Times ativos", value: 4, tone: "text-trilho-text" },
];

export function StatsSummary() {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat) => (
                <div
                    key={stat.label}
                    className="rounded-xl border border-trilho-border bg-trilho-surface p-4"
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-trilho-dim">
                        {stat.label}
                    </p>
                    <p className={`mt-2 text-2xl font-semibold ${stat.tone}`}>
                        {stat.value}
                    </p>
                </div>
            ))}
        </div>
    );
}
