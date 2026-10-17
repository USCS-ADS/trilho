import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, NO_ASSIGNEE, filterColumns, hasActiveFilters } from "./filter-columns";
import type { KanbanCardData, KanbanColumnData } from "./types";

function card(id: string, title: string, overrides: Partial<KanbanCardData> = {}): KanbanCardData {
    return { id, title, tags: [], priority: "medium", isOverdue: false, ...overrides };
}

const columns: KanbanColumnData[] = [
    {
        id: "todo",
        label: "A fazer",
        cards: [
            card("1", "Revisão do relatório", { assigneeId: "10", priority: "urgent" }),
            card("2", "Criar endpoint", { assigneeId: "11" }),
        ],
    },
    { id: "done", label: "Concluído", cards: [card("3", "Configurar CI", { priority: "low" })] },
];

const titles = (result: KanbanColumnData[]) => result.flatMap((c) => c.cards.map((x) => x.title));

describe("filterColumns", () => {
    it("sem filtros devolve as mesmas colunas", () => {
        expect(filterColumns(columns, EMPTY_FILTERS)).toBe(columns);
    });

    it("busca no título ignorando caixa e acentos", () => {
        expect(titles(filterColumns(columns, { ...EMPTY_FILTERS, search: "REVISAO" }))).toEqual([
            "Revisão do relatório",
        ]);
    });

    it("filtra por prioridade", () => {
        expect(titles(filterColumns(columns, { ...EMPTY_FILTERS, priority: "low" }))).toEqual([
            "Configurar CI",
        ]);
    });

    it("filtra por responsável e por tarefa do time inteiro", () => {
        expect(titles(filterColumns(columns, { ...EMPTY_FILTERS, assigneeId: "11" }))).toEqual([
            "Criar endpoint",
        ]);
        expect(titles(filterColumns(columns, { ...EMPTY_FILTERS, assigneeId: NO_ASSIGNEE }))).toEqual([
            "Configurar CI",
        ]);
    });

    it("combina os filtros (E lógico) e mantém todas as colunas", () => {
        const result = filterColumns(columns, { search: "criar", assigneeId: "10", priority: "" });

        expect(titles(result)).toEqual([]);
        expect(result.map((c) => c.id)).toEqual(["todo", "done"]);
    });
});

describe("hasActiveFilters", () => {
    it("ignora busca só com espaços", () => {
        expect(hasActiveFilters({ ...EMPTY_FILTERS, search: "   " })).toBe(false);
        expect(hasActiveFilters({ ...EMPTY_FILTERS, priority: "high" })).toBe(true);
    });
});
