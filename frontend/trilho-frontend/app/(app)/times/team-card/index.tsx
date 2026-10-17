import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { Card } from "@/app/components/card";
import { ProgressBar } from "@/app/components/progress-bar";
import type { TeamWithMembers } from "@/app/lib/teams/types";
import { getWorkloadTone } from "@/app/lib/teams/workload";

interface TeamCardProps {
    team: TeamWithMembers;
    leaderName: string;
    /** Ausente = o usuário não gerencia este time. */
    onManage?: () => void;
}

export function TeamCard({ team, leaderName, onManage }: TeamCardProps) {
    const rows = [
        { label: "Membros", value: team.members.length },
        { label: "Tarefas em andamento", value: team.tasksInProgress },
        { label: "Carga de trabalho", value: `${team.workload}%` },
    ];

    return (
        <Card>
            <div className="mb-4 flex items-center gap-3">
                <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-trilho-surface-2 text-lg font-semibold text-trilho-accent-2"
                >
                    {team.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                    <h2 className="truncate font-semibold text-trilho-text">{team.name}</h2>
                    <p className="truncate text-xs text-trilho-dim">Líder: {leaderName}</p>
                </div>
                {team.isArchived && (
                    <span className="ml-auto shrink-0">
                        <Badge tone="warning">Arquivado</Badge>
                    </span>
                )}
            </div>

            <dl className="mb-3 flex flex-col gap-2 text-sm">
                {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                        <dt className="text-trilho-dim">{row.label}</dt>
                        <dd className="font-medium text-trilho-text">{row.value}</dd>
                    </div>
                ))}
            </dl>

            <ProgressBar
                value={team.workload}
                tone={getWorkloadTone(team.workload)}
                label={`Carga de trabalho do time ${team.name}`}
            />

            {onManage && (
                <Button
                    type="button"
                    variant="secondary"
                    className="mt-4 w-full text-sm"
                    onClick={onManage}
                    aria-label={`Gerenciar o time ${team.name}`}
                >
                    Gerenciar
                </Button>
            )}
        </Card>
    );
}
