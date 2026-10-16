import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import type { KanbanColumnData } from "./types";

interface KanbanColumnProps {
    column: KanbanColumnData;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    return (
        <div className="flex w-72 shrink-0 flex-col">
            <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-trilho-dim">
                    {column.label}
                </p>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-trilho-surface-3 px-1.5 text-[11px] text-trilho-dim">
                    {column.cards.length}
                </span>
            </div>

            <SortableContext
                items={column.cards.map((card) => card.id)}
                strategy={verticalListSortingStrategy}
            >
                <div
                    ref={setNodeRef}
                    className={`flex min-h-32 flex-1 flex-col gap-2 rounded-lg p-1 transition-colors ${
                        isOver ? "bg-trilho-surface-2/60" : ""
                    }`}
                >
                    {column.cards.map((card) => (
                        <KanbanCard key={card.id} card={card} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}
