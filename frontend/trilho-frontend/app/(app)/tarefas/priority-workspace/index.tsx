"use client";

import { Button } from "@/app/components/button";
import { controlClasses } from "@/app/components/form-field";
import { CheckIcon } from "@/app/components/icons";
import { PageHeader } from "@/app/components/page-header";
import { useState } from "react";
import { RankedTaskRow } from "../ranked-task-row";
import type { RankedTaskView } from "../types";

interface PriorityWorkspaceProps {
    teams: { id: string; name: string }[];
    defaultTeamId: string;
    rankingsByTeam: Record<string, RankedTaskView[]>;
}

export function PriorityWorkspace({ teams, defaultTeamId, rankingsByTeam }: PriorityWorkspaceProps) {
    const [teamId, setTeamId] = useState(defaultTeamId);
    const [appliedTeamIds, setAppliedTeamIds] = useState<string[]>([]);

    const team = teams.find((candidate) => candidate.id === teamId);
    const ranking = rankingsByTeam[teamId] ?? [];
    const isApplied = appliedTeamIds.includes(teamId);

    function handleApply() {
        // TODO: persistir as novas prioridades via API (decisão final do líder, RF07).
        setAppliedTeamIds((previous) => [...previous, teamId]);
    }

    return (
        <>
            <PageHeader
                title="Sugestão de Priorização por IA"
                description={team ? `Time ${team.name}` : undefined}
            />

            <div className="p-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-trilho-dim">
                        Ordenado por prioridade sugerida · Time {team?.name}
                    </p>

                    <div className="flex items-center gap-3">
                        <select
                            aria-label="Time"
                            value={teamId}
                            onChange={(event) => setTeamId(event.target.value)}
                            className={`${controlClasses(false)} w-auto py-1.5 text-sm`}
                        >
                            {teams.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>

                        <Button
                            type="button"
                            className="shrink-0 gap-1.5 whitespace-nowrap text-sm"
                            onClick={handleApply}
                            disabled={isApplied || ranking.length === 0}
                        >
                            {isApplied && <CheckIcon className="h-4 w-4" />}
                            {isApplied ? "Sugestões aplicadas" : "Aplicar sugestões"}
                        </Button>
                    </div>
                </div>

                {ranking.length === 0 ? (
                    <p className="rounded-xl border border-trilho-border bg-trilho-surface px-4 py-6 text-center text-sm text-trilho-dim">
                        Nenhuma tarefa em aberto neste time.
                    </p>
                ) : (
                    <ol className="flex flex-col gap-3">
                        {ranking.map((item, index) => (
                            <RankedTaskRow
                                key={item.id}
                                rank={index + 1}
                                item={item}
                                applied={isApplied}
                            />
                        ))}
                    </ol>
                )}

                <p className="mt-4 text-xs text-trilho-dim">
                    A sugestão é uma recomendação: a decisão final de prioridade e atribuição
                    permanece com o líder do time.
                </p>
            </div>
        </>
    );
}
