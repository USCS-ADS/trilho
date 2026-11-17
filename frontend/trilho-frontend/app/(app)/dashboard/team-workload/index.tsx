import { Card, CardTitle } from "@/app/components/card";
import { ProgressBar } from "@/app/components/progress-bar";
import type { DashboardData } from "@/app/lib/dashboard/types";
import { getWorkloadTone } from "@/app/lib/teams/workload";

interface TeamWorkloadProps {
    workloads: DashboardData["workloads"];
    thresholdPercent: number;
}

export function TeamWorkload({ workloads, thresholdPercent }: TeamWorkloadProps) {
    const teams = [...workloads].sort((a, b) => b.percent - a.percent);
    const overloadedTeam = teams.find((team) => team.percent > thresholdPercent);

    return (
        <Card>
            <CardTitle>Carga de trabalho por time</CardTitle>

            {teams.length === 0 && (
                <p className="text-sm text-trilho-dim">Nenhum time ativo ainda.</p>
            )}

            <div className="flex flex-col gap-3">
                {teams.map((team) => (
                    <div key={team.id} className="flex items-center gap-3">
                        <span className="w-32 shrink-0 truncate text-sm text-trilho-dim">{team.name}</span>
                        <div className="flex-1">
                            <ProgressBar
                                value={team.percent}
                                tone={getWorkloadTone(team.percent)}
                                label={`Carga de trabalho do time ${team.name}`}
                            />
                        </div>
                        <span className="w-10 shrink-0 text-right text-sm text-trilho-text">
                            {team.percent}%
                        </span>
                    </div>
                ))}
            </div>

            {overloadedTeam && (
                <p className="mt-4 rounded-lg border border-trilho-danger/20 bg-trilho-danger/10 px-3 py-2 text-sm text-trilho-danger">
                    ⚠ O time <strong>{overloadedTeam.name}</strong> está acima de {thresholdPercent}% da
                    capacidade estimada. Considere realocar tarefas.
                </p>
            )}
        </Card>
    );
}
