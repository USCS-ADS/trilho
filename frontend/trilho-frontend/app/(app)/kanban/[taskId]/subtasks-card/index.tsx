"use client";

import { Button } from "@/app/components/button";
import { Card, CardTitle } from "@/app/components/card";
import { CheckIcon } from "@/app/components/icons";
import { ProgressBar } from "@/app/components/progress-bar";
import { FormEvent, useRef, useState } from "react";
import { createSubtaskAction, toggleSubtaskAction } from "../actions";

export interface SubtaskView {
    id: string;
    title: string;
    done: boolean;
    assigneeInitials?: string;
}

interface SubtasksCardProps {
    taskId: string;
    initialSubtasks: SubtaskView[];
}

export function SubtasksCard({ taskId, initialSubtasks }: SubtasksCardProps) {
    const [subtasks, setSubtasks] = useState(initialSubtasks);
    const [error, setError] = useState<string>();
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [draftTitle, setDraftTitle] = useState("");
    const localIdCounter = useRef(0);

    const doneCount = subtasks.filter((subtask) => subtask.done).length;
    const percent = subtasks.length ? Math.round((doneCount / subtasks.length) * 100) : 0;

    async function toggleSubtask(subtaskId: string) {
        const current = subtasks.find((subtask) => subtask.id === subtaskId);
        if (!current) return;

        setError(undefined);
        // Otimista: marca já e desfaz se o servidor recusar (RF04).
        setSubtasks((previous) =>
            previous.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask,
            ),
        );

        const result = await toggleSubtaskAction(taskId, subtaskId, current.title, !current.done);

        if (!result.ok) {
            setSubtasks((previous) =>
                previous.map((subtask) =>
                    subtask.id === subtaskId ? { ...subtask, done: current.done } : subtask,
                ),
            );
            setError(result.message);
        }
    }

    async function handleAdd(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const title = draftTitle.trim();
        if (!title) return;

        setError(undefined);
        setIsSaving(true);
        const result = await createSubtaskAction(taskId, title);
        setIsSaving(false);

        if (!result.ok) {
            setError(result.message);
            return;
        }

        // Sem API (modo demonstração) o item existe só no cliente.
        localIdCounter.current += 1;
        const created = result.subtask ?? {
            id: `local-subtask-${localIdCounter.current}`,
            title,
            done: false,
        };

        setSubtasks((previous) => [...previous, created]);
        setDraftTitle("");
        setIsAdding(false);
    }

    return (
        <Card>
            <div className="mb-3 flex items-center justify-between gap-3">
                <CardTitle className="mb-0">
                    Subtarefas · {doneCount}/{subtasks.length} concluídas
                </CardTitle>
                <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="text-xs font-medium text-trilho-accent-2 hover:underline"
                >
                    + Adicionar subtarefa
                </button>
            </div>

            <ProgressBar
                value={percent}
                tone="cyan"
                size="sm"
                label="Progresso das subtarefas"
            />

            {error && (
                <p role="alert" className="mt-3 text-sm text-trilho-danger">
                    {error}
                </p>
            )}

            {subtasks.length === 0 && !isAdding && (
                <p className="mt-4 text-sm text-trilho-dim">
                    Nenhuma subtarefa ainda. Divida a entrega em etapas menores.
                </p>
            )}

            <ul className="mt-2 divide-y divide-trilho-border">
                {subtasks.map((subtask) => (
                    <li key={subtask.id} className="flex items-center justify-between gap-3 py-3">
                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-sm">
                            <input
                                type="checkbox"
                                checked={subtask.done}
                                onChange={() => toggleSubtask(subtask.id)}
                                className="peer sr-only"
                            />
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-trilho-border text-trilho-bg peer-checked:border-trilho-success peer-checked:bg-trilho-success peer-focus-visible:ring-2 peer-focus-visible:ring-trilho-accent">
                                {subtask.done && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                            </span>
                            <span
                                className={
                                    subtask.done ? "text-trilho-dim line-through" : "text-trilho-text"
                                }
                            >
                                {subtask.title}
                            </span>
                        </label>

                        {subtask.assigneeInitials && (
                            <span className="shrink-0 text-[10px] text-trilho-dim">
                                {subtask.assigneeInitials}
                            </span>
                        )}
                    </li>
                ))}
            </ul>

            {isAdding && (
                <form onSubmit={handleAdd} className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                        type="text"
                        value={draftTitle}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        placeholder="Título da subtarefa"
                        aria-label="Título da nova subtarefa"
                        autoFocus
                        className="min-w-0 flex-1 rounded-lg border border-trilho-border bg-trilho-surface-2 p-2 text-sm text-trilho-text focus:border-trilho-accent focus:outline-none"
                    />
                    <Button type="submit" className="text-sm" disabled={!draftTitle.trim() || isSaving}>
                        {isSaving ? "Adicionando..." : "Adicionar"}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        className="text-sm"
                        onClick={() => {
                            setDraftTitle("");
                            setIsAdding(false);
                        }}
                    >
                        Cancelar
                    </Button>
                </form>
            )}
        </Card>
    );
}
