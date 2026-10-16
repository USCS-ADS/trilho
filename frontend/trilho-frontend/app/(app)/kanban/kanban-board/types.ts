import type { BadgeTone } from "@/app/components/badge";

export interface KanbanTag {
    label: string;
    tone: BadgeTone;
}

/** Visão de uma tarefa como card do board (derivada de `Task`, ver `build-columns.ts`). */
export interface KanbanCardData {
    id: string;
    title: string;
    tags: KanbanTag[];
    /** Ausente quando a tarefa é do time inteiro. */
    assigneeInitials?: string;
    isOverdue: boolean;
    /** Ausente em cards criados só no cliente (ainda sem página de detalhe). */
    href?: string;
}

export interface KanbanColumnData {
    id: string;
    label: string;
    cards: KanbanCardData[];
}
