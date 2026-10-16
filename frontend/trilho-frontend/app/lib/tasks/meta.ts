import type { BadgeTone } from "@/app/components/badge";
import type { TaskPriority, TaskStatus } from "./types";

/** Ordem das colunas do Kanban (RF05). */
export const TASK_STATUSES: TaskStatus[] = ["backlog", "todo", "in-progress", "in-review", "done"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
    backlog: "Backlog",
    todo: "A Fazer",
    "in-progress": "Em Andamento",
    "in-review": "Em Revisão",
    done: "Concluído",
};

export const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente",
};

/** Rótulo curto exibido nos cards do board. */
export const PRIORITY_SHORT_LABELS: Record<TaskPriority, string> = {
    low: "P3",
    medium: "P2",
    high: "P1",
    urgent: "Urgente",
};

export const PRIORITY_TONES: Record<TaskPriority, BadgeTone> = {
    low: "neutral",
    medium: "accent",
    high: "warning",
    urgent: "danger",
};
