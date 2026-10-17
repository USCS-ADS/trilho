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
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { KanbanCardOverlay } from "./kanban-card";
import { KanbanColumn } from "./kanban-column";
import type { KanbanCardData, KanbanColumnData } from "./types";

function findColumnByCardId(columns: KanbanColumnData[], cardId: string) {
    return columns.find((column) => column.cards.some((card) => card.id === cardId));
}

function findColumnById(columns: KanbanColumnData[], columnId: string) {
    return columns.find((column) => column.id === columnId);
}

/** Resultado de um arrasto que mudou o card de coluna e/ou posição. */
export interface CardMove {
    cardId: string;
    columnId: string;
    /** Índice final dentro da coluna (a partir de 0). */
    position: number;
    /** Estado do board antes do arrasto, para desfazer se o servidor recusar. */
    rollback: KanbanColumnData[];
}

interface KanbanBoardProps {
    columns: KanbanColumnData[];
    onColumnsChange: Dispatch<SetStateAction<KanbanColumnData[]>>;
    onCardMoved?: (move: CardMove) => void;
    /** Com filtros ativos há cards escondidos: reordenar daria posições erradas, então o arrasto é desligado. */
    isDragDisabled?: boolean;
}

export function KanbanBoard({
    columns,
    onColumnsChange,
    onCardMoved,
    isDragDisabled = false,
}: KanbanBoardProps) {
    const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);
    const dragSnapshot = useRef<KanbanColumnData[]>(columns);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    function handleDragStart(event: DragStartEvent) {
        const cardId = String(event.active.id);
        dragSnapshot.current = columns;
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

        onColumnsChange((prevColumns) => {
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

    /** Ajusta a posição final do card e avisa quem persiste (coluna/posição novas). */
    function handleDragEnd(event: DragEndEvent) {
        setActiveCard(null);

        const { active, over } = event;
        const activeId = String(active.id);
        let finalColumns = columns;

        if (over && activeId !== String(over.id)) {
            const column = findColumnByCardId(columns, activeId);
            const oldIndex = column?.cards.findIndex((card) => card.id === activeId) ?? -1;
            const newIndex = column?.cards.findIndex((card) => card.id === String(over.id)) ?? -1;

            if (column && oldIndex !== -1 && newIndex !== -1) {
                finalColumns = columns.map((col) =>
                    col.id === column.id
                        ? { ...col, cards: arrayMove(col.cards, oldIndex, newIndex) }
                        : col,
                );
                onColumnsChange(finalColumns);
            }
        }

        const startColumn = findColumnByCardId(dragSnapshot.current, activeId);
        const endColumn = findColumnByCardId(finalColumns, activeId);
        if (!startColumn || !endColumn) return;

        const startIndex = startColumn.cards.findIndex((card) => card.id === activeId);
        const endIndex = endColumn.cards.findIndex((card) => card.id === activeId);

        // Soltou onde estava: nada a persistir.
        if (startColumn.id === endColumn.id && startIndex === endIndex) return;

        onCardMoved?.({
            cardId: activeId,
            columnId: endColumn.id,
            position: endIndex,
            rollback: dragSnapshot.current,
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
                    <KanbanColumn key={column.id} column={column} isDragDisabled={isDragDisabled} />
                ))}
            </div>

            <DragOverlay>
                {activeCard && <KanbanCardOverlay card={activeCard} />}
            </DragOverlay>
        </DndContext>
    );
}
