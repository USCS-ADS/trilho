"use client";

import { Button } from "@/app/components/button";
import { controlClasses } from "@/app/components/form-field";
import { CheckIcon } from "@/app/components/icons";
import { PageHeader } from "@/app/components/page-header";
import { useState } from "react";
import { applyRankingAction } from "../actions";
import { RankedTaskRow } from "../ranked-task-row";
import type { RankedTaskView } from "../types";

interface PriorityWorkspaceProps {
    teams: { id: string; name: string }[];
    defaultTeamId: string;
    rankingsByTeam: Record<string, RankedTaskView[]>;
    /** Times em que o usuário pode aplicar as sugestões (administrador: todos; líder: o próprio). */
    applicableTeamIds: string[];
}

export function PriorityWorkspace({
    teams,
    defaultTeamId,
    rankingsByTeam,
    applicableTeamIds,
}: PriorityWorkspaceProps) {
    const [teamId, setTeamId] = useState(defaultTeamId);
    const [appliedTeamIds, setAppliedTeamIds] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string }>();
    const [isApplying, setIsApplying] = useState(false);

    const team = teams.find((candidate) => candidate.id === teamId);
    const ranking = rankingsByTeam[teamId] ?? [];
    const isApplied = appliedTeamIds.includes(teamId);
    const canApply = applicableTeamIds.includes(teamId);

    async function handleApply() {
        setFeedback(undefined);
        setIsApplying(true);

        const result = await applyRankingAction(teamId);

        setIsApplying(false);

        if (!result.ok) {
            setFeedback({ tone: "error", text: result.message });
            return;
        }

        setAppliedTeamIds((previous) => [...previous, teamId]);
        setFeedback({
            tone: "success",
            text:
                result.updated > 0
                    ? `${result.updated} ${result.updated === 1 ? "prioridade atualizada" : "prioridades atualizadas"} no Kanban.`
                    : "As prioridades já estavam de acordo com as sugestões.",
        });
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
                            onChange={(event) => {
                                setTeamId(event.target.value);
                                setFeedback(undefined);
                            }}
                            className={`${controlClasses(false)} w-auto py-1.5 text-sm`}
                        >
                            {teams.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>

                        {canApply && (
                            <Button
                                type="button"
                                className="shrink-0 gap-1.5 whitespace-nowrap text-sm"
                                onClick={handleApply}
                                disabled={isApplied || isApplying || ranking.length === 0}
                            >
                                {isApplied && <CheckIcon className="h-4 w-4" />}
                                {isApplying
                                    ? "Aplicando..."
                                    : isApplied
                                      ? "Sugestões aplicadas"
                                      : "Aplicar sugestões"}
                            </Button>
                        )}
                    </div>
                </div>

                {feedback && (
                    <p
                        role={feedback.tone === "error" ? "alert" : "status"}
                        className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                            feedback.tone === "error"
                                ? "border-trilho-danger/30 bg-trilho-danger/10 text-trilho-danger"
                                : "border-trilho-success/30 bg-trilho-success/10 text-trilho-success"
                        }`}
                    >
                        {feedback.text}
                    </p>
                )}

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
