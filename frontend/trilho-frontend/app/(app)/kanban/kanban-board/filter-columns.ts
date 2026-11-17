import type { TaskPriority } from "@/app/lib/tasks/types";
import type { KanbanColumnData } from "./types";

export const NO_ASSIGNEE = "none";

export interface BoardFilters {
    /** Trecho do título, sem diferenciar maiúsculas/acentos. */
    search: string;
    /** "" = todos; `NO_ASSIGNEE` = tarefas do time inteiro; senão, o id do responsável. */
    assigneeId: string;
    priority: TaskPriority | "";
}

export const EMPTY_FILTERS: BoardFilters = { search: "", assigneeId: "", priority: "" };

export function hasActiveFilters(filters: BoardFilters) {
    return filters.search.trim() !== "" || filters.assigneeId !== "" || filters.priority !== "";
}

function normalize(text: string) {
    return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Mantém as colunas e esconde os cards que não passam em todos os filtros ativos. */
export function filterColumns(columns: KanbanColumnData[], filters: BoardFilters): KanbanColumnData[] {
    if (!hasActiveFilters(filters)) return columns;

    const search = normalize(filters.search.trim());

    return columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => {
            if (search && !normalize(card.title).includes(search)) return false;
            if (filters.priority && card.priority !== filters.priority) return false;

            if (filters.assigneeId === NO_ASSIGNEE) return !card.assigneeId;
            if (filters.assigneeId && card.assigneeId !== filters.assigneeId) return false;

            return true;
        }),
    }));
}
