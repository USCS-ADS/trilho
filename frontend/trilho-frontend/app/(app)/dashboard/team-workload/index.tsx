import { Card, CardTitle } from "@/app/components/card";
import { ProgressBar } from "@/app/components/progress-bar";
import { CAPACITY_THRESHOLD, getWorkloadTone, listTeams } from "@/app/lib/teams";

export function TeamWorkload() {
    const teams = [...listTeams()].sort((a, b) => b.workload - a.workload);
    const overloadedTeam = teams.find((team) => team.workload > CAPACITY_THRESHOLD);

    return (
        <Card>
            <CardTitle>Carga de trabalho por time</CardTitle>

            <div className="flex flex-col gap-3">
                {teams.map((team) => (
                    <div key={team.id} className="flex items-center gap-3">
                        <span className="w-32 shrink-0 text-sm text-trilho-dim">{team.name}</span>
                        <div className="flex-1">
                            <ProgressBar
                                value={team.workload}
                                tone={getWorkloadTone(team.workload)}
                                label={`Carga de trabalho do time ${team.name}`}
                            />
                        </div>
                        <span className="w-10 shrink-0 text-right text-sm text-trilho-text">
                            {team.workload}%
                        </span>
                    </div>
                ))}
            </div>

            {overloadedTeam && (
                <p className="mt-4 rounded-lg border border-trilho-danger/20 bg-trilho-danger/10 px-3 py-2 text-sm text-trilho-danger">
                    ⚠ O time <strong>{overloadedTeam.name}</strong> está acima de{" "}
                    {CAPACITY_THRESHOLD}% da capacidade estimada. Considere realocar tarefas.
                </p>
            )}
        </Card>
    );
}
