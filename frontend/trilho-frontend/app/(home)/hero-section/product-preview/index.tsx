import { Logo } from "@/app/components/logo";
import {
    CardTagTone,
    KANBAN_COLUMNS,
    SIDEBAR_NAV_ITEMS,
} from "./mock-data";

const TAG_TONE_CLASSES: Record<CardTagTone, string> = {
    priority: "bg-trilho-surface-3 text-trilho-text",
    info: "bg-trilho-surface-3 text-trilho-text",
    success: "bg-trilho-success/15 text-trilho-success",
    ai: "bg-trilho-accent/15 text-trilho-accent",
};

/** Print ilustrativo do produto (quadro Kanban), exibido na hero da landing page. */
export function ProductPreview() {
    return (
        <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-xl border border-trilho-border bg-trilho-surface text-left shadow-trilho">
            <div className="flex items-center gap-2 border-b border-trilho-border px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-trilho-danger" />
                <span className="h-3 w-3 rounded-full bg-trilho-warning" />
                <span className="h-3 w-3 rounded-full bg-trilho-success" />
            </div>

            <div className="flex">
                <aside className="hidden w-48 flex-col gap-1 border-r border-trilho-border p-4 sm:flex">
                    <div className="mb-4 flex items-center gap-2">
                        <Logo size={24} />
                        <span className="text-sm font-semibold text-trilho-text">
                            Trilho
                        </span>
                    </div>

                    {SIDEBAR_NAV_ITEMS.map((item) => (
                        <span
                            key={item.label}
                            className={`rounded-md px-3 py-2 text-xs ${
                                item.active
                                    ? "bg-trilho-surface-2 text-trilho-text"
                                    : "text-trilho-dim"
                            }`}
                        >
                            {item.label}
                        </span>
                    ))}
                </aside>

                <div className="flex-1 p-5">
                    <h3 className="text-sm font-semibold text-trilho-text">
                        Quadro Kanban
                    </h3>
                    <p className="mb-4 text-xs text-trilho-dim">
                        Time Backend · líder: Ana Luiza
                    </p>

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {KANBAN_COLUMNS.map((column) => (
                            <div key={column.label}>
                                <p className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-trilho-dim">
                                    {column.label}
                                    <span>{column.count}</span>
                                </p>

                                <div className="flex flex-col gap-2">
                                    {column.cards.map((card) => (
                                        <div
                                            key={card.title}
                                            className="rounded-lg border border-trilho-border bg-trilho-surface-2 p-2 text-xs text-trilho-text"
                                        >
                                            <p className="mb-2 leading-snug">{card.title}</p>
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={`rounded px-1.5 py-0.5 text-[10px] ${TAG_TONE_CLASSES[card.tag.tone]}`}
                                                >
                                                    {card.tag.label}
                                                </span>
                                                {card.assigneeInitials && (
                                                    <span className="text-[10px] text-trilho-dim">
                                                        {card.assigneeInitials}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
