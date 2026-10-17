import { PRIORITY_SHORT_LABELS, PRIORITY_TONES } from "@/app/lib/tasks/meta";
import type { NewTaskInput } from "@/app/lib/tasks/types";
import type { KanbanCardData } from "./types";

/** Card de uma tarefa recém-criada no cliente (ainda não persistida, sem página de detalhe). */
export function draftToCard(
    id: string,
    input: NewTaskInput,
    assigneeInitials?: string,
): KanbanCardData {
    return {
        id,
        title: input.title,
        tags: [
            {
                label: PRIORITY_SHORT_LABELS[input.priority],
                tone: PRIORITY_TONES[input.priority],
            },
        ],
        priority: input.priority,
        assigneeId: input.assigneeId || undefined,
        assigneeInitials,
        isOverdue: false,
    };
}
