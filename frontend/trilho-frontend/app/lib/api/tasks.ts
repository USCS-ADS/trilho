import "server-only";
import { getTaskById, listTasks } from "../tasks";
import type { NewTaskInput, Task, TaskActivity, TaskAiSuggestion } from "../tasks/types";
import { apiFetch, apiFetchRaw } from "./client";
import { isMockMode } from "./config";
import type {
    RequestMoveTaskJson,
    RequestTaskJson,
    RequestUpdateSubtaskJson,
    ResponseActivityJson,
    ResponsePrioritySuggestionJson,
    ResponseRankedTaskJson,
    ResponseSubtaskJson,
    ResponseCommentJson,
    ResponseTaskJson,
    ResponseTaskSummaryJson,
} from "./dtos";
import { ApiError } from "./errors";
import { activityFromApi, taskFromDetail, taskFromSummary } from "./mappers";

const BOARD_PAGE_SIZE = 1000;

/** Ranking do time: só entra como "sugestão" a tarefa cuja prioridade sugerida difere da atual. */
async function fetchSuggestions(teamId: string, token: string): Promise<Map<string, TaskAiSuggestion>> {
    const suggestions = new Map<string, TaskAiSuggestion>();

    try {
        const ranking = await apiFetch<ResponseRankedTaskJson[]>(
            `/api/Prioritization/ranking?teamId=${encodeURIComponent(teamId)}`,
            { token },
        );

        for (const item of ranking ?? []) {
            if (item.suggestedPriority === item.currentPriority) continue;

            suggestions.set(String(item.taskId), {
                priority: item.suggestedPriority as TaskAiSuggestion["priority"],
                justification: item.justification,
            });
        }
    } catch {
        // A sugestão é um enfeite: se falhar, o board segue sem ela.
    }

    return suggestions;
}

/** Tarefas do quadro de um time (GET /api/Task?teamId=), já com as sugestões de prioridade. */
export async function fetchTeamTasks(teamId: string, token: string): Promise<Task[]> {
    if (isMockMode) return listTasks().filter((task) => task.teamId === teamId);

    const [board, suggestions] = await Promise.all([
        apiFetchRaw<ResponseTaskSummaryJson[]>(
            `/api/Task?teamId=${encodeURIComponent(teamId)}&pageSize=${BOARD_PAGE_SIZE}`,
            { token },
        ),
        fetchSuggestions(teamId, token),
    ]);

    return (board.data ?? []).map((dto) => {
        const task = taskFromSummary(dto);
        const suggestion = suggestions.get(task.id);

        return suggestion && task.status !== "done" ? { ...task, aiSuggestion: suggestion } : task;
    });
}

/** Detalhe (GET /api/Task/{id}); `undefined` se não existe (404) ou o usuário não participa do time (403). */
export async function fetchTask(taskId: string, token: string): Promise<Task | undefined> {
    if (isMockMode) return getTaskById(taskId);

    try {
        const dto = await apiFetch<ResponseTaskJson>(`/api/Task/${encodeURIComponent(taskId)}`, { token });
        if (!dto) return undefined;

        const task = taskFromDetail(dto);
        const suggestion = (await fetchSuggestions(task.teamId, token)).get(task.id);

        return suggestion && task.status !== "done" ? { ...task, aiSuggestion: suggestion } : task;
    } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 403)) return undefined;
        throw error;
    }
}

export async function fetchTaskActivity(taskId: string, token: string): Promise<TaskActivity[]> {
    if (isMockMode) return [];

    const entries = await apiFetch<ResponseActivityJson[]>(
        `/api/Task/${encodeURIComponent(taskId)}/activity`,
        { token },
    );

    return (entries ?? []).map(activityFromApi);
}

/** POST /api/Task — o backend valida participação no time e responsável membro. */
export async function createTask(input: NewTaskInput, token: string): Promise<Task> {
    const body: RequestTaskJson = {
        title: input.title,
        description: input.description,
        teamId: Number(input.teamId),
        assigneeId: input.assigneeId ? Number(input.assigneeId) : null,
        dueDate: input.dueDate ?? null,
        priority: input.priority,
    };

    const created = await apiFetch<ResponseTaskJson>("/api/Task", { method: "POST", body, token });
    if (!created) throw new ApiError(502, []);

    return taskFromDetail(created);
}

/** PUT /api/Task/{id}/move — 409 se tentar concluir com subtarefas pendentes (RF04). */
export async function moveTask(taskId: string, status: string, position: number, token: string) {
    const body: RequestMoveTaskJson = { status, position };

    await apiFetch<undefined>(`/api/Task/${encodeURIComponent(taskId)}/move`, {
        method: "PUT",
        body,
        token,
    });
}

export async function createSubtask(taskId: string, title: string, token: string) {
    const created = await apiFetch<ResponseSubtaskJson>(`/api/Task/${encodeURIComponent(taskId)}/subtask`, {
        method: "POST",
        body: { title },
        token,
    });
    if (!created) throw new ApiError(502, []);

    return { id: String(created.id), title: created.title, done: created.isDone };
}

export async function updateSubtask(
    taskId: string,
    subtaskId: string,
    changes: { title: string; done: boolean; assigneeId?: string },
    token: string,
) {
    const body: RequestUpdateSubtaskJson = {
        title: changes.title,
        isDone: changes.done,
        assigneeId: changes.assigneeId ? Number(changes.assigneeId) : null,
    };

    await apiFetch<undefined>(
        `/api/Task/${encodeURIComponent(taskId)}/subtask/${encodeURIComponent(subtaskId)}`,
        { method: "PUT", body, token },
    );
}

export async function createComment(taskId: string, body: string, token: string) {
    const created = await apiFetch<ResponseCommentJson>(`/api/Task/${encodeURIComponent(taskId)}/comment`, {
        method: "POST",
        body: { body },
        token,
    });
    if (!created) throw new ApiError(502, []);

    return {
        id: String(created.id),
        authorName: created.authorName,
        body: created.body,
    };
}

/** POST /api/Prioritization/suggest — sugestão de responsável do time (menor carga). */
export async function fetchAssigneeSuggestion(
    teamId: string,
    token: string,
): Promise<{ userId: string; name: string; openTasks: number } | undefined> {
    if (isMockMode) return undefined;

    try {
        const suggestion = await apiFetch<ResponsePrioritySuggestionJson>("/api/Prioritization/suggest", {
            method: "POST",
            body: { teamId: Number(teamId) },
            token,
        });
        const assignee = suggestion?.suggestedAssignee;

        return assignee
            ? { userId: String(assignee.userId), name: assignee.name, openTasks: assignee.openTasks }
            : undefined;
    } catch {
        return undefined;
    }
}

/** PUT /api/Task/{id} — qualquer membro do time edita (o status só muda pelo "mover"). */
export async function updateTask(
    taskId: string,
    changes: {
        title: string;
        description: string;
        assigneeId?: string;
        dueDate?: string;
        priority: string;
    },
    token: string,
) {
    await apiFetch<undefined>(`/api/Task/${encodeURIComponent(taskId)}`, {
        method: "PUT",
        body: {
            title: changes.title,
            description: changes.description,
            assigneeId: changes.assigneeId ? Number(changes.assigneeId) : null,
            dueDate: changes.dueDate ?? null,
            priority: changes.priority,
        },
        token,
    });
}

/** DELETE /api/Task/{id} — administrador ou líder do time; 409 com subtarefas pendentes. */
export async function deleteTask(taskId: string, token: string) {
    await apiFetch<undefined>(`/api/Task/${encodeURIComponent(taskId)}`, { method: "DELETE", token });
}

export async function deleteSubtask(taskId: string, subtaskId: string, token: string) {
    await apiFetch<undefined>(
        `/api/Task/${encodeURIComponent(taskId)}/subtask/${encodeURIComponent(subtaskId)}`,
        { method: "DELETE", token },
    );
}

/** O autor apaga o próprio comentário; líder do time e administrador moderam. */
export async function deleteComment(taskId: string, commentId: string, token: string) {
    await apiFetch<undefined>(
        `/api/Task/${encodeURIComponent(taskId)}/comment/${encodeURIComponent(commentId)}`,
        { method: "DELETE", token },
    );
}
