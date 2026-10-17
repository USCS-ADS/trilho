import { daysBetween } from "../date";
import type { Task, TaskPriority } from "../tasks/types";
import { getUserById } from "../teams";
import { suggestPriority } from "./priority";

export interface RankedTask {
    task: Task;
    suggestedPriority: TaskPriority;
    /** Justificativa em linguagem simples (RF07). */
    justification: string;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

function pluralize(count: number, singular: string, plural: string) {
    return `${count} ${count === 1 ? singular : plural}`;
}

function describeDeadline(task: Task, today: string): string {
    if (!task.dueDate) return "sem prazo definido";

    const daysLeft = daysBetween(today, task.dueDate);
    if (daysLeft < 0) {
        return `prazo vencido há ${pluralize(Math.abs(daysLeft), "dia", "dias")}`;
    }
    if (daysLeft === 0) return "prazo vence hoje";
    return `prazo em ${pluralize(daysLeft, "dia", "dias")}`;
}

function buildJustification(task: Task, openByAssignee: Map<string, number>, today: string) {
    if (task.priority === "urgent") {
        return "Marcada como urgente pela liderança; permanece no topo da lista.";
    }

    const deadline = describeDeadline(task, today);
    const assignee = getUserById(task.assigneeId);

    if (!assignee) return `${deadline.charAt(0).toUpperCase()}${deadline.slice(1)}.`;

    const firstName = assignee.name.split(" ")[0];
    const openCount = openByAssignee.get(assignee.id) ?? 0;
    return `${firstName} tem ${pluralize(openCount, "tarefa", "tarefas")} em aberto e ${deadline}.`;
}

/**
 * Mock do ranking de priorização (RF07). Regras: tarefas marcadas manualmente
 * como "Urgente" ficam sempre no topo, depois vem a prioridade sugerida e, em
 * empate, o prazo mais próximo.
 * Só usado no modo demonstração; com a API ligada o ranking vem de GET /api/Prioritization/ranking.
 */
export function rankTasks(tasks: Task[], today: string): RankedTask[] {
    const openTasks = tasks.filter((task) => task.status !== "done");

    const openByAssignee = new Map<string, number>();
    for (const task of openTasks) {
        if (!task.assigneeId) continue;
        openByAssignee.set(task.assigneeId, (openByAssignee.get(task.assigneeId) ?? 0) + 1);
    }

    return openTasks
        .map((task) => ({
            task,
            suggestedPriority:
                task.priority === "urgent" ? "urgent" : suggestPriority(today, task.dueDate),
            justification: buildJustification(task, openByAssignee, today),
        }))
        .sort((a, b) => {
            const declaredUrgentDiff =
                Number(b.task.priority === "urgent") - Number(a.task.priority === "urgent");
            if (declaredUrgentDiff !== 0) return declaredUrgentDiff;

            const priorityDiff =
                PRIORITY_ORDER[a.suggestedPriority] - PRIORITY_ORDER[b.suggestedPriority];
            if (priorityDiff !== 0) return priorityDiff;

            return (a.task.dueDate ?? "9999-12-31").localeCompare(b.task.dueDate ?? "9999-12-31");
        });
}
