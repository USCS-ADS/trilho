import { Card, CardTitle } from "@/app/components/card";
import type { DashboardData } from "@/app/lib/dashboard/types";

export function SprintChart({ sprints }: { sprints: NonNullable<DashboardData["sprints"]> }) {
    const maxValue = Math.max(1, ...sprints.map((sprint) => sprint.completed));

    return (
        <Card>
            <CardTitle>Tarefas concluídas por sprint</CardTitle>

            <div className="flex h-40 items-stretch gap-3">
                {sprints.map((sprint) => (
                    <div key={sprint.label} className="flex flex-1 flex-col items-center gap-2">
                        <span className="text-xs text-trilho-text">{sprint.completed}</span>
                        <div className="flex w-full flex-1 items-end">
                            <div
                                className={`w-full rounded-t-md ${
                                    sprint.isCurrent ? "bg-trilho-accent-2" : "bg-trilho-surface-3"
                                }`}
                                style={{ height: `${(sprint.completed / maxValue) * 100}%`, minHeight: "2px" }}
                            />
                        </div>
                        <span className={`text-xs ${sprint.isCurrent ? "text-trilho-text" : "text-trilho-dim"}`}>
                            {sprint.label}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
