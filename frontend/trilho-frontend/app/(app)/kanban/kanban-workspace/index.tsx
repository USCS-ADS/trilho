"use client";

import { Button } from "@/app/components/button";
import { PlusIcon } from "@/app/components/icons";
import { PageHeader } from "@/app/components/page-header";
import type { AssigneeSuggestion } from "@/app/lib/ai-suggestions/assignee";
import type { NewTaskInput } from "@/app/lib/tasks/types";
import type { TeamWithMembers } from "@/app/lib/teams/types";
import Link from "next/link";
import { useRef, useState } from "react";
import { createTaskAction, moveTaskAction } from "../actions";
import { KanbanBoard } from "../kanban-board";
import type { CardMove } from "../kanban-board/board";
import { draftToCard } from "../kanban-board/draft-to-card";
import type { KanbanColumnData } from "../kanban-board/types";
import { NewTaskModal } from "../new-task-modal";

interface KanbanWorkspaceProps {
    initialColumns: KanbanColumnData[];
    team: { id: string; name: string; memberCount: number; leaderName: string };
    /** Times que o usuário pode abrir no quadro (troca por link, via ?team=). */
    teamOptions: { id: string; name: string }[];
    teams: TeamWithMembers[];
    assigneeSuggestions: Record<string, AssigneeSuggestion | undefined>;
    today: string;
}

/** Estado compartilhado entre o cabeçalho (botão), o modal de nova tarefa e o board. */
export function KanbanWorkspace({
    initialColumns,
    team,
    teamOptions,
    teams,
    assigneeSuggestions,
    today,
}: KanbanWorkspaceProps) {
    const [columns, setColumns] = useState(initialColumns);
    const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
    const [moveError, setMoveError] = useState<string>();
    const localIdCounter = useRef(0);

    /** Devolve a mensagem de erro (ou `undefined` se criou) para o modal exibir. */
    async function handleCreateTask(input: NewTaskInput): Promise<string | undefined> {
        const result = await createTaskAction(input);
        if (!result.ok) return result.message;

        let card = result.card;

        if (!card) {
            // Modo demonstração (sem API): o cartão existe só no cliente.
            localIdCounter.current += 1;
            const assignee = teams
                .flatMap((candidate) => candidate.members)
                .find((member) => member.id === input.assigneeId);
            card = draftToCard(`local-task-${localIdCounter.current}`, input, assignee?.initials);
        }

        const created = card;

        // O quadro mostra um time por vez: tarefa de outro time só aparece ao abrir aquele time.
        if (input.teamId === team.id) {
            setColumns((previous) =>
                previous.map((column) =>
                    column.id === "backlog"
                        ? { ...column, cards: [created, ...column.cards] }
                        : column,
                ),
            );
        }

        return undefined;
    }

    async function handleCardMoved(move: CardMove) {
        setMoveError(undefined);

        // Cartões criados só no cliente (modo demonstração) não existem no servidor.
        if (move.cardId.startsWith("local-")) return;

        const result = await moveTaskAction(move.cardId, move.columnId, move.position);

        if (!result.ok) {
            setColumns(move.rollback);
            setMoveError(result.message);
        }
    }

    return (
        <>
            <PageHeader
                title="Quadro Kanban"
                description={`Time ${team.name} · ${team.memberCount} membros · líder: ${team.leaderName}`}
                actions={
                    <>
                        {teamOptions.length > 1 ? (
                            <nav aria-label="Times" className="flex flex-wrap gap-1.5">
                                {teamOptions.map((option) => (
                                    <Link
                                        key={option.id}
                                        href={`/kanban?team=${option.id}`}
                                        aria-current={option.id === team.id ? "page" : undefined}
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            option.id === team.id
                                                ? "bg-trilho-accent-2/15 text-trilho-accent-2"
                                                : "border border-trilho-border text-trilho-dim hover:text-trilho-text"
                                        }`}
                                    >
                                        {option.name}
                                    </Link>
                                ))}
                            </nav>
                        ) : (
                            <span className="rounded-full bg-trilho-accent-2/15 px-3 py-1 text-xs font-medium text-trilho-accent-2">
                                Time {team.name}
                            </span>
                        )}
                        <Button
                            type="button"
                            className="gap-1.5 text-sm"
                            onClick={() => setIsNewTaskOpen(true)}
                        >
                            <PlusIcon className="h-4 w-4" />
                            Nova tarefa
                        </Button>
                    </>
                }
            />

            <div className="p-8">
                {moveError && (
                    <p
                        role="alert"
                        className="mb-4 rounded-lg border border-trilho-danger/20 bg-trilho-danger/10 px-3 py-2 text-sm text-trilho-danger"
                    >
                        {moveError}
                    </p>
                )}

                <KanbanBoard
                    columns={columns}
                    onColumnsChange={setColumns}
                    onCardMoved={handleCardMoved}
                />
            </div>

            <NewTaskModal
                open={isNewTaskOpen}
                onClose={() => setIsNewTaskOpen(false)}
                onCreate={handleCreateTask}
                teams={teams}
                defaultTeamId={team.id}
                assigneeSuggestions={assigneeSuggestions}
                today={today}
            />
        </>
    );
}
