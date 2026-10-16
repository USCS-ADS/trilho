import type { TaskPriority } from "@/app/lib/tasks/types";

/** Linha do painel de priorização, já resolvida para exibição. */
export interface RankedTaskView {
    id: string;
    title: string;
    href: string;
    /** Ausente quando a tarefa é do time inteiro. */
    assigneeInitials?: string;
    currentPriority: TaskPriority;
    suggestedPriority: TaskPriority;
    justification: string;
}
