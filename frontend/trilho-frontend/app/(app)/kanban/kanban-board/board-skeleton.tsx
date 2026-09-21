import { KanbanColumnData } from "./mock-data";

/**
 * Versão estática do board, sem os hooks do dnd-kit. Renderizada até o
 * componente montar no cliente, pra evitar mismatch de hidratação: os
 * atributos de acessibilidade que o dnd-kit gera (aria-describedby) usam um
 * contador que o Strict Mode do React incrementa de forma diferente no
 * servidor e no cliente. Sem interatividade nesta versão não há nada pra
 * dessincronizar.
 */
export function BoardSkeleton({ columns }: { columns: KanbanColumnData[] }) {
    return (
        <div className="flex gap-4 overflow-x-auto pb-2">
            {columns.map((column) => (
                <div key={column.id} className="flex w-72 shrink-0 flex-col">
                    <div className="mb-3 flex items-center justify-between px-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-trilho-dim">
                            {column.label}
                        </p>
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-trilho-surface-3 px-1.5 text-[11px] text-trilho-dim">
                            {column.cards.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        {column.cards.map((card) => (
                            <div
                                key={card.id}
                                className="h-16 animate-pulse rounded-lg border border-trilho-border bg-trilho-surface-2"
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
