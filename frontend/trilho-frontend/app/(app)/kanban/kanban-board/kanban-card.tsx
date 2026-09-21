import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BoltIcon } from "@/app/components/icons";
import { KanbanCardData, KanbanTagTone } from "./mock-data";

const TAG_TONE_CLASSES: Record<KanbanTagTone, string> = {
    danger: "bg-trilho-danger/15 text-trilho-danger",
    warning: "bg-trilho-warning/15 text-trilho-warning",
    neutral: "bg-trilho-surface-3 text-trilho-dim",
    info: "bg-trilho-surface-3 text-trilho-text",
    ai: "bg-trilho-accent/15 text-trilho-accent",
    success: "bg-trilho-success/15 text-trilho-success",
};

/** Conteúdo visual do card, sem nenhuma lógica de drag — reaproveitado pelo card real e pelo clone do `DragOverlay`. */
export function KanbanCardContent({ card }: { card: KanbanCardData }) {
    return (
        <>
            <p className="mb-2 leading-snug text-trilho-text">{card.title}</p>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                    {card.tags.map((tag) => (
                        <span
                            key={tag.label}
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] ${TAG_TONE_CLASSES[tag.tone]}`}
                        >
                            {tag.tone === "ai" && <BoltIcon className="h-3 w-3" />}
                            {tag.label}
                        </span>
                    ))}
                </div>

                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-trilho-surface-3 text-[10px] text-trilho-dim">
                    {card.assigneeInitials}
                </span>
            </div>
        </>
    );
}

/** O card real dentro de uma coluna — arrastável via `useSortable`. */
export function KanbanCard({ card }: { card: KanbanCardData }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`cursor-grab rounded-lg border border-trilho-border bg-trilho-surface-2 p-3 text-sm active:cursor-grabbing ${
                isDragging ? "opacity-40" : ""
            }`}
        >
            <KanbanCardContent card={card} />
        </div>
    );
}
