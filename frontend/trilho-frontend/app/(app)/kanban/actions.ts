"use server";

import { toUserMessage } from "@/app/lib/api/errors";
import { createTask, moveTask } from "@/app/lib/api/tasks";
import { fetchTeamById } from "@/app/lib/api/teams";
import { isMockMode } from "@/app/lib/api/config";
import { verifySession } from "@/app/lib/session/dal";
import { TASK_STATUSES } from "@/app/lib/tasks/meta";
import type { NewTaskInput } from "@/app/lib/tasks/types";
import { todayIso } from "@/app/lib/date";
import { validate } from "@/app/lib/validation";
import { revalidatePath } from "next/cache";
import { taskToCard } from "./kanban-board/build-columns";
import type { KanbanCardData } from "./kanban-board/types";
import { newTaskSchema } from "./new-task-modal/schema";

export type CreateTaskResult =
    | { ok: true; card?: KanbanCardData }
    | { ok: false; message: string };

export type MoveTaskResult = { ok: true } | { ok: false; message: string };

/**
 * Cria a tarefa na API. No modo demonstração (sem backend) devolve `ok` sem cartão
 * e o cliente cria o cartão localmente, como antes.
 */
export async function createTaskAction(input: NewTaskInput): Promise<CreateTaskResult> {
    const session = await verifySession();

    const result = validate(newTaskSchema, input);
    if (!result.success) return { ok: false, message: Object.values(result.errors)[0] };

    if (isMockMode) return { ok: true };

    try {
        const task = await createTask(result.data, session.token);

        // Iniciais do responsável para o avatar do cartão.
        const team = await fetchTeamById(task.teamId, session.token);
        const initialsByUserId = Object.fromEntries(
            (team?.members ?? []).map((member) => [member.id, member.initials]),
        );

        revalidatePath("/kanban");
        revalidatePath("/times");

        return { ok: true, card: taskToCard(task, todayIso(), initialsByUserId) };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}

/** Persiste coluna/posição após o arrasto. Erros de regra (ex: subtarefas pendentes) voltam como mensagem. */
export async function moveTaskAction(
    taskId: string,
    status: string,
    position: number,
): Promise<MoveTaskResult> {
    const session = await verifySession();

    if (!TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number]) || !Number.isInteger(position) || position < 0) {
        return { ok: false, message: "Movimento inválido." };
    }

    if (isMockMode) return { ok: true };

    try {
        await moveTask(taskId, status, position, session.token);
        revalidatePath("/kanban");
        return { ok: true };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}
