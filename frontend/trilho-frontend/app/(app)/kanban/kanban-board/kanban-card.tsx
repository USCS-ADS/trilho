import { Avatar } from "@/app/components/avatar";
import { Badge } from "@/app/components/badge";
import { BoltIcon } from "@/app/components/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { ReactNode, useRef } from "react";
import type { KanbanCardData } from "./types";

function cardClasses(isOverdue: boolean) {
    return `rounded-lg border bg-trilho-surface-2 p-3 text-sm ${
        isOverdue ? "border-trilho-danger/60" : "border-trilho-border"
    }`;
}

/** Conteúdo visual do card, sem nenhuma lógica de drag — reaproveitado pelo card real e pelo clone do `DragOverlay`. */
export function KanbanCardContent({ card, title }: { card: KanbanCardData; title?: ReactNode }) {
    return (
        <>
            <p className="mb-2 leading-snug text-trilho-text">{title ?? card.title}</p>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                    {card.tags.map((tag) => (
                        <Badge
                            key={tag.label}
                            tone={tag.tone}
                            icon={tag.tone === "ai" ? <BoltIcon className="h-3 w-3" /> : undefined}
                        >
                            {tag.label}
                        </Badge>
                    ))}
                </div>

                {card.assigneeInitials ? (
                    <Avatar initials={card.assigneeInitials} size="sm" />
                ) : (
                    <span className="text-[10px] text-trilho-dim">Time</span>
                )}
            </div>
        </>
    );
}

/** Wrapper visual do clone exibido no `DragOverlay`. */
export function KanbanCardOverlay({ card }: { card: KanbanCardData }) {
    return (
        <div className={`rotate-1 shadow-trilho ${cardClasses(card.isOverdue)}`}>
            <KanbanCardContent card={card} />
        </div>
    );
}

/** O card real dentro de uma coluna — arrastável via `useSortable`; o título abre o detalhe. */
export function KanbanCard({ card }: { card: KanbanCardData }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: card.id });
    const pointerStart = useRef<{ x: number; y: number } | null>(null);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Um arrasto termina num "click" no mesmo elemento; ignora se o ponteiro andou.
    const title = card.href ? (
        <Link
            href={card.href}
            className="hover:underline"
            onPointerDown={(event) => {
                pointerStart.current = { x: event.clientX, y: event.clientY };
            }}
            onClick={(event) => {
                const start = pointerStart.current;
                if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4) {
                    event.preventDefault();
                }
            }}
        >
            {card.title}
        </Link>
    ) : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing ${cardClasses(card.isOverdue)} ${
                isDragging ? "opacity-40" : ""
            }`}
        >
            <KanbanCardContent card={card} title={title} />
        </div>
    );
}
