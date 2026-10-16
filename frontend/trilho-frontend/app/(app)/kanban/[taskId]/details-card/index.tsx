import { Badge } from "@/app/components/badge";
import { Card, CardTitle } from "@/app/components/card";
import { formatDate } from "@/app/lib/date";
import { PRIORITY_LABELS, PRIORITY_TONES } from "@/app/lib/tasks/meta";
import type { Task } from "@/app/lib/tasks/types";
import type { ReactNode } from "react";

interface DetailsCardProps {
    task: Task;
    teamName: string;
    /** Ausente = tarefa do time inteiro. */
    assigneeName?: string;
    isOverdue: boolean;
}

export function DetailsCard({ task, teamName, assigneeName, isOverdue }: DetailsCardProps) {
    const rows: { label: string; value: ReactNode }[] = [
        { label: "Responsável", value: assigneeName ?? "Time inteiro" },
        { label: "Time", value: teamName },
        {
            label: "Prazo",
            value: task.dueDate ? (
                <span className="inline-flex items-center gap-2">
                    {isOverdue && <Badge tone="danger">atrasada</Badge>}
                    {formatDate(task.dueDate)}
                </span>
            ) : (
                "—"
            ),
        },
        {
            label: "Prioridade",
            value: <Badge tone={PRIORITY_TONES[task.priority]}>{PRIORITY_LABELS[task.priority]}</Badge>,
        },
    ];

    return (
        <Card>
            <CardTitle>Detalhes</CardTitle>

            <dl className="flex flex-col gap-3 text-sm">
                {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                        <dt className="text-trilho-dim">{row.label}</dt>
                        <dd className="text-right text-trilho-text">{row.value}</dd>
                    </div>
                ))}
            </dl>
        </Card>
    );
}
