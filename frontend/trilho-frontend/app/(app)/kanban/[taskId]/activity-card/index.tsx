import { Card, CardTitle } from "@/app/components/card";
import { formatRelative } from "@/app/lib/date";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/app/lib/tasks/meta";
import type { TaskActivity, TaskPriority, TaskStatus } from "@/app/lib/tasks/types";

interface ActivityCardProps {
    entries: TaskActivity[];
    /** Nome por id de usuário (para "alterou o responsável"). */
    usersById: Record<string, string>;
}

function statusLabel(value?: string) {
    return STATUS_LABELS[value as TaskStatus] ?? value ?? "—";
}

function priorityLabel(value?: string) {
    return PRIORITY_LABELS[value as TaskPriority] ?? value ?? "—";
}

function userLabel(value: string | undefined, usersById: Record<string, string>) {
    if (!value) return "Time inteiro";
    return usersById[value] ?? `#${value}`;
}

function formatIsoDate(value?: string) {
    if (!value) return "sem prazo";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
}

/** Texto em português para cada tipo de evento do histórico (RF05). */
export function describeActivity(entry: TaskActivity, usersById: Record<string, string>): string {
    switch (entry.type) {
        case "created":
            return `criou a tarefa em ${statusLabel(entry.toValue)}`;
        case "updated":
            return "editou o título ou a descrição";
        case "status-changed":
            return `moveu de ${statusLabel(entry.fromValue)} para ${statusLabel(entry.toValue)}`;
        case "priority-changed":
            return `alterou a prioridade de ${priorityLabel(entry.fromValue)} para ${priorityLabel(entry.toValue)}`;
        case "assignee-changed":
            return `alterou o responsável de ${userLabel(entry.fromValue, usersById)} para ${userLabel(entry.toValue, usersById)}`;
        case "due-date-changed":
            return `alterou o prazo de ${formatIsoDate(entry.fromValue)} para ${formatIsoDate(entry.toValue)}`;
        case "comment-added":
            return "comentou";
        case "subtask-added":
            return `adicionou a subtarefa "${entry.toValue ?? ""}"`;
        case "subtask-completed":
            return `concluiu a subtarefa "${entry.toValue ?? ""}"`;
        case "subtask-reopened":
            return `reabriu a subtarefa "${entry.toValue ?? ""}"`;
        case "git-pr-opened":
            return `${entry.toValue ?? "PR"} aberto`;
        case "git-pr-merged":
            return `${entry.toValue ?? "PR"} mesclado`;
        case "git-pr-closed":
            return `${entry.toValue ?? "PR"} fechado sem merge`;
        default:
            return "atualizou a tarefa";
    }
}

export function ActivityCard({ entries, usersById }: ActivityCardProps) {
    return (
        <Card>
            <CardTitle>Histórico</CardTitle>

            {entries.length === 0 ? (
                <p className="text-sm text-trilho-dim">Sem alterações registradas.</p>
            ) : (
                <ol className="flex flex-col gap-3">
                    {entries.map((entry) => (
                        <li key={entry.id} className="text-sm">
                            <p className="text-trilho-text">
                                <strong>{entry.actorName}</strong> {describeActivity(entry, usersById)}
                            </p>
                            <p className="text-xs text-trilho-dim">{formatRelative(entry.createdAt)}</p>
                        </li>
                    ))}
                </ol>
            )}
        </Card>
    );
}
