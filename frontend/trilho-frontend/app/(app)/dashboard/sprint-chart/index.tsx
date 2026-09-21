// TODO: substituir por dados reais da API (tarefas concluídas por sprint).
const SPRINT_COMPLETIONS = [
    { sprint: "S1", value: 18, tone: "bg-trilho-surface-3" },
    { sprint: "S2", value: 22, tone: "bg-trilho-surface-3" },
    { sprint: "S3", value: 24, tone: "bg-trilho-surface-3" },
    { sprint: "S4", value: 30, tone: "bg-trilho-accent" },
    { sprint: "S5", value: 34, tone: "bg-trilho-accent-2" },
];

export function SprintChart() {
    const maxValue = Math.max(...SPRINT_COMPLETIONS.map((sprint) => sprint.value));

    return (
        <div className="rounded-xl border border-trilho-border bg-trilho-surface p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-trilho-dim">
                Tarefas concluídas por sprint
            </p>

            <div className="flex h-40 items-stretch gap-3">
                {SPRINT_COMPLETIONS.map((sprint) => (
                    <div
                        key={sprint.sprint}
                        className="flex flex-1 flex-col items-center gap-2"
                    >
                        <div className="flex w-full flex-1 items-end">
                            <div
                                className={`w-full rounded-t-md ${sprint.tone}`}
                                style={{ height: `${(sprint.value / maxValue) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-trilho-dim">{sprint.sprint}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
