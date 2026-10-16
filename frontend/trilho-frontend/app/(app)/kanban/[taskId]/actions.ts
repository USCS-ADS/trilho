"use server";

import { isMockMode } from "@/app/lib/api/config";
import { toUserMessage } from "@/app/lib/api/errors";
import { createComment, createSubtask, updateSubtask } from "@/app/lib/api/tasks";
import { verifySession } from "@/app/lib/session/dal";
import { revalidatePath } from "next/cache";

export type SubtaskCreated =
    | { ok: true; subtask?: { id: string; title: string; done: boolean } }
    | { ok: false; message: string };

export type CommentCreated =
    | { ok: true; comment?: { id: string; authorName: string; body: string } }
    | { ok: false; message: string };

export type SimpleResult = { ok: true } | { ok: false; message: string };

const MAX_SUBTASK_TITLE = 200;
const MAX_COMMENT_BODY = 2000;

/** No modo demonstração devolve `ok` sem dados: o cliente mantém o item só localmente. */
export async function createSubtaskAction(taskId: string, title: string): Promise<SubtaskCreated> {
    const session = await verifySession();

    const clean = title.trim();
    if (!clean) return { ok: false, message: "Informe o título da subtarefa." };
    if (clean.length > MAX_SUBTASK_TITLE) {
        return { ok: false, message: "O título da subtarefa deve ter no máximo 200 caracteres." };
    }

    if (isMockMode) return { ok: true };

    try {
        const subtask = await createSubtask(taskId, clean, session.token);
        revalidatePath(`/kanban/${taskId}`);
        return { ok: true, subtask };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}

export async function toggleSubtaskAction(
    taskId: string,
    subtaskId: string,
    title: string,
    done: boolean,
): Promise<SimpleResult> {
    const session = await verifySession();

    if (isMockMode || subtaskId.startsWith("local-")) return { ok: true };

    try {
        await updateSubtask(taskId, subtaskId, { title, done }, session.token);
        revalidatePath(`/kanban/${taskId}`);
        return { ok: true };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}

export async function createCommentAction(taskId: string, body: string): Promise<CommentCreated> {
    const session = await verifySession();

    const clean = body.trim();
    if (!clean) return { ok: false, message: "Escreva o comentário." };
    if (clean.length > MAX_COMMENT_BODY) {
        return { ok: false, message: "O comentário deve ter no máximo 2000 caracteres." };
    }

    if (isMockMode) return { ok: true };

    try {
        const comment = await createComment(taskId, clean, session.token);
        revalidatePath(`/kanban/${taskId}`);
        return { ok: true, comment };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}
