import { STATUS_LABELS, TASK_STATUSES } from "@/app/lib/tasks/meta";

/**
 * Esqueleto estático do board, exibido enquanto o board interativo (dnd-kit)
 * carrega só no cliente — ver comentário em `index.tsx`.
 */
export function BoardSkeleton() {
    return (
        <div className="flex gap-4 overflow-x-auto pb-2">
            {TASK_STATUSES.map((status) => (
                <div key={status} className="flex w-72 shrink-0 flex-col">
                    <div className="mb-3 px-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-trilho-dim">
                            {STATUS_LABELS[status]}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        {[0, 1, 2].map((index) => (
                            <div
                                key={index}
                                className="h-16 animate-pulse rounded-lg border border-trilho-border bg-trilho-surface-2"
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
