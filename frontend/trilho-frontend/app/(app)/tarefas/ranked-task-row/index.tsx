import { Avatar } from "@/app/components/avatar";
import { Badge } from "@/app/components/badge";
import { PRIORITY_LABELS, PRIORITY_TONES } from "@/app/lib/tasks/meta";
import Link from "next/link";
import type { RankedTaskView } from "../types";

interface RankedTaskRowProps {
    rank: number;
    item: RankedTaskView;
    /** Depois de aplicadas, a prioridade atual passa a ser a sugerida. */
    applied: boolean;
}

export function RankedTaskRow({ rank, item, applied }: RankedTaskRowProps) {
    const isUrgent = item.suggestedPriority === "urgent";
    const differsFromCurrent = !applied && item.currentPriority !== item.suggestedPriority;

    return (
        <li className="flex items-center gap-4 rounded-xl border border-trilho-border bg-trilho-surface px-4 py-3">
            <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    isUrgent
                        ? "bg-trilho-danger/15 text-trilho-danger"
                        : "bg-trilho-surface-2 text-trilho-accent-2"
                }`}
            >
                {rank}
            </span>

            <div className="min-w-0 flex-1">
                <Link
                    href={item.href}
                    className="font-medium text-trilho-text hover:underline"
                >
                    {item.title}
                </Link>
                <p className="mt-0.5 text-sm text-trilho-dim">{item.justification}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
                {differsFromCurrent && (
                    <span className="hidden text-xs text-trilho-dim sm:inline">
                        atual: {PRIORITY_LABELS[item.currentPriority]}
                    </span>
                )}
                <Badge tone={PRIORITY_TONES[item.suggestedPriority]}>
                    {PRIORITY_LABELS[item.suggestedPriority]}
                </Badge>
                {item.assigneeInitials ? (
                    <Avatar initials={item.assigneeInitials} />
                ) : (
                    <span className="w-9 text-center text-xs text-trilho-dim">Time</span>
                )}
            </div>
        </li>
    );
}
