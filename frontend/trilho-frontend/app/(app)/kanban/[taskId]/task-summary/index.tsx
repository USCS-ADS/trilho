import { Badge } from "@/app/components/badge";
import { Card } from "@/app/components/card";
import { formatDate } from "@/app/lib/date";
import {
    PRIORITY_LABELS,
    PRIORITY_SHORT_LABELS,
    PRIORITY_TONES,
    STATUS_LABELS,
} from "@/app/lib/tasks/meta";
import type { Task } from "@/app/lib/tasks/types";

interface TaskSummaryProps {
    task: Task;
    teamName: string;
    creatorName: string;
}

export function TaskSummary({ task, teamName, creatorName }: TaskSummaryProps) {
    const suggestion = task.aiSuggestion;

    return (
        <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <Badge tone="accent">{STATUS_LABELS[task.status]}</Badge>
                {suggestion && (
                    <Badge tone={PRIORITY_TONES[suggestion.priority]}>
                        Sugerido: {PRIORITY_SHORT_LABELS[suggestion.priority]} (
                        {PRIORITY_LABELS[suggestion.priority]})
                    </Badge>
                )}
            </div>

            <h2 className="text-xl font-semibold text-trilho-text">{task.title}</h2>
            <p className="mt-1 text-sm text-trilho-dim">
                Time {teamName} · criada por {creatorName} em {formatDate(task.createdAt)}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-trilho-dim">
                {task.description || "Esta tarefa ainda não tem descrição."}
            </p>
        </Card>
    );
}
