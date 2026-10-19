import { STATUS_LABELS, TASK_STATUSES, PRIORITY_SHORT_LABELS, PRIORITY_TONES } from "@/app/lib/tasks/meta";
import { isOverdue } from "@/app/lib/tasks/overdue";
import type { Task } from "@/app/lib/tasks/types";
import type { KanbanCardData, KanbanColumnData, KanbanTag } from "./types";

function getCardTags(task: Task, today: string): KanbanTag[] {
    const tags: KanbanTag[] = [];

    if (task.status === "done") {
        tags.push({ label: "Feito", tone: "success" });
    } else {
        tags.push({
            label: PRIORITY_SHORT_LABELS[task.priority],
            tone: PRIORITY_TONES[task.priority],
        });
    }

    if (task.aiSuggestion && task.status !== "done") {
        tags.push({ label: "sugerida priorização", tone: "ai" });
    }

    const pullRequest = task.git?.pullRequest;
    if (pullRequest?.state === "merged") {
        tags.push({ label: "merged", tone: "success" });
    } else if (pullRequest) {
        tags.push({ label: `PR #${pullRequest.number}`, tone: "info" });
        if (task.status === "in-review") tags.push({ label: "em revisão", tone: "warning" });
    } else if (task.git) {
        tags.push({ label: task.git.branch, tone: "info" });
    }

    if (isOverdue(task, today)) tags.push({ label: "atrasada", tone: "danger" });

    return tags;
}

/** `initialsByUserId`: iniciais por id de usuário (membros do time), para o avatar do responsável. */
export function taskToCard(
    task: Task,
    today: string,
    initialsByUserId: Record<string, string> = {},
): KanbanCardData {
    return {
        id: task.id,
        title: task.title,
        tags: getCardTags(task, today),
        priority: task.priority,
        assigneeId: task.assigneeId,
        assigneeInitials: task.assigneeId ? initialsByUserId[task.assigneeId] : undefined,
        isOverdue: isOverdue(task, today),
        href: `/kanban/${task.id}`,
    };
}

/** Agrupa as tarefas nas colunas padrão do Kanban (RF05), na ordem em que aparecem. */
export function buildColumns(
    tasks: Task[],
    today: string,
    initialsByUserId: Record<string, string> = {},
): KanbanColumnData[] {
    return TASK_STATUSES.map((status) => ({
        id: status,
        label: STATUS_LABELS[status],
        cards: tasks
            .filter((task) => task.status === status)
            .map((task) => taskToCard(task, today, initialsByUserId)),
    }));
}
