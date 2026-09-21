const CAPACITY_THRESHOLD = 85;

// TODO: substituir por dados reais da API (carga de trabalho por time).
const TEAM_WORKLOAD = [
    { name: "Dados", load: 91, tone: "bg-trilho-danger" },
    { name: "Backend", load: 78, tone: "bg-trilho-warning" },
    { name: "Frontend", load: 62, tone: "bg-trilho-accent-2" },
    { name: "Machine Learning", load: 54, tone: "bg-trilho-success" },
];

export function TeamWorkload() {
    const overloadedTeam = TEAM_WORKLOAD.find((team) => team.load > CAPACITY_THRESHOLD);

    return (
        <div className="rounded-xl border border-trilho-border bg-trilho-surface p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-trilho-dim">
                Carga de trabalho por time
            </p>

            <div className="flex flex-col gap-3">
                {TEAM_WORKLOAD.map((team) => (
                    <div key={team.name} className="flex items-center gap-3">
                        <span className="w-32 shrink-0 text-sm text-trilho-dim">
                            {team.name}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-trilho-surface-2">
                            <div
                                className={`h-full rounded-full ${team.tone}`}
                                style={{ width: `${team.load}%` }}
                            />
                        </div>
                        <span className="w-10 shrink-0 text-right text-sm text-trilho-text">
                            {team.load}%
                        </span>
                    </div>
                ))}
            </div>

            {overloadedTeam && (
                <p className="mt-4 rounded-lg border border-trilho-danger/20 bg-trilho-danger/10 px-3 py-2 text-sm text-trilho-danger">
                    ⚠ O time <strong>{overloadedTeam.name}</strong> está acima de{" "}
                    {CAPACITY_THRESHOLD}% da capacidade estimada. Considere realocar
                    tarefas.
                </p>
            )}
        </div>
    );
}
