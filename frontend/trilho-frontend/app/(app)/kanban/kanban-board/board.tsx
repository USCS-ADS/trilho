"use client";

import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";
import { KanbanCardContent } from "./kanban-card";
import { KanbanColumn } from "./kanban-column";
import { INITIAL_COLUMNS, KanbanCardData, KanbanColumnData } from "./mock-data";

function findColumnByCardId(columns: KanbanColumnData[], cardId: string) {
    return columns.find((column) => column.cards.some((card) => card.id === cardId));
}

function findColumnById(columns: KanbanColumnData[], columnId: string) {
    return columns.find((column) => column.id === columnId);
}

export function KanbanBoard() {
    const [columns, setColumns] = useState(INITIAL_COLUMNS);
    const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    function handleDragStart(event: DragStartEvent) {
        const cardId = String(event.active.id);
        const column = findColumnByCardId(columns, cardId);
        setActiveCard(column?.cards.find((card) => card.id === cardId) ?? null);
    }

    /** Move o card pra coluna sobre a qual ele está passando, em tempo real. */
    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);
        if (activeId === overId) return;

        setColumns((prevColumns) => {
            const sourceColumn = findColumnByCardId(prevColumns, activeId);
            const targetColumn =
                findColumnByCardId(prevColumns, overId) ?? findColumnById(prevColumns, overId);

            if (!sourceColumn || !targetColumn || sourceColumn.id === targetColumn.id) {
                return prevColumns;
            }

            const movedCard = sourceColumn.cards.find((card) => card.id === activeId);
            if (!movedCard) return prevColumns;

            const overCardIndex = targetColumn.cards.findIndex((card) => card.id === overId);
            const insertIndex = overCardIndex >= 0 ? overCardIndex : targetColumn.cards.length;

            return prevColumns.map((column) => {
                if (column.id === sourceColumn.id) {
                    return {
                        ...column,
                        cards: column.cards.filter((card) => card.id !== activeId),
                    };
                }
                if (column.id === targetColumn.id) {
                    const newCards = [...column.cards];
                    newCards.splice(insertIndex, 0, movedCard);
                    return { ...column, cards: newCards };
                }
                return column;
            });
        });
    }

    /** Ajusta a posição final do card dentro da coluna em que ele foi soltado. */
    function handleDragEnd(event: DragEndEvent) {
        setActiveCard(null);
        // TODO: persistir a nova coluna/posição do card via API aqui.

        const { active, over } = event;
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);
        if (activeId === overId) return;

        setColumns((prevColumns) => {
            const column = findColumnByCardId(prevColumns, activeId);
            if (!column) return prevColumns;

            const oldIndex = column.cards.findIndex((card) => card.id === activeId);
            const newIndex = column.cards.findIndex((card) => card.id === overId);
            if (oldIndex === -1 || newIndex === -1) return prevColumns;

            return prevColumns.map((col) =>
                col.id === column.id
                    ? { ...col, cards: arrayMove(col.cards, oldIndex, newIndex) }
                    : col,
            );
        });
    }

    return (
        <DndContext
            id="kanban-board"
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-2">
                {columns.map((column) => (
                    <KanbanColumn key={column.id} column={column} />
                ))}
            </div>

            <DragOverlay>
                {activeCard && (
                    <div className="rotate-1 rounded-lg border border-trilho-border bg-trilho-surface-2 p-3 text-sm shadow-trilho">
                        <KanbanCardContent card={activeCard} />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
