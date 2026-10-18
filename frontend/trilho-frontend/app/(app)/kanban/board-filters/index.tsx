"use client";

import { PRIORITY_LABELS, PRIORITIES } from "@/app/lib/tasks/meta";
import type { TaskPriority } from "@/app/lib/tasks/types";
import { EMPTY_FILTERS, NO_ASSIGNEE, hasActiveFilters, type BoardFilters as FiltersState } from "../kanban-board/filter-columns";

interface BoardFiltersProps {
    filters: FiltersState;
    onChange: (filters: FiltersState) => void;
    members: { id: string; name: string }[];
    /** Cards visíveis / total, para o aviso "X de Y tarefas". */
    visibleCount: number;
    totalCount: number;
}

const FIELD =
    "rounded-lg border border-trilho-border bg-trilho-surface-2 px-3 py-1.5 text-sm text-trilho-text focus:border-trilho-accent focus:outline-none";

/** Busca por título e filtros de responsável e prioridade (só no cliente: o quadro já está carregado). */
export function BoardFilters({ filters, onChange, members, visibleCount, totalCount }: BoardFiltersProps) {
    const active = hasActiveFilters(filters);

    return (
        <div role="search" aria-label="Filtrar tarefas" className="mb-4 flex flex-wrap items-center gap-2">
            <input
                type="search"
                aria-label="Buscar tarefa por título"
                placeholder="Buscar por título"
                value={filters.search}
                onChange={(event) => onChange({ ...filters, search: event.target.value })}
                className={`${FIELD} min-w-48 flex-1 sm:max-w-xs`}
            />

            <select
                aria-label="Filtrar por responsável"
                value={filters.assigneeId}
                onChange={(event) => onChange({ ...filters, assigneeId: event.target.value })}
                className={FIELD}
            >
                <option value="">Todos os responsáveis</option>
                <option value={NO_ASSIGNEE}>Sem responsável (time)</option>
                {members.map((member) => (
                    <option key={member.id} value={member.id}>
                        {member.name}
                    </option>
                ))}
            </select>

            <select
                aria-label="Filtrar por prioridade"
                value={filters.priority}
                onChange={(event) =>
                    onChange({ ...filters, priority: event.target.value as TaskPriority | "" })
                }
                className={FIELD}
            >
                <option value="">Todas as prioridades</option>
                {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                        {PRIORITY_LABELS[priority]}
                    </option>
                ))}
            </select>

            {active && (
                <>
                    <button
                        type="button"
                        onClick={() => onChange(EMPTY_FILTERS)}
                        className="text-sm text-trilho-accent-2 hover:underline"
                    >
                        Limpar filtros
                    </button>
                    <span role="status" className="text-xs text-trilho-dim">
                        {visibleCount} de {totalCount} tarefas · arrastar fica desligado com filtros ativos
                    </span>
                </>
            )}
        </div>
    );
}
