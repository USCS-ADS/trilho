"use server";

import { isMockMode } from "@/app/lib/api/config";
import { toUserMessage } from "@/app/lib/api/errors";
import { applyRanking } from "@/app/lib/api/prioritization";
import { verifySession } from "@/app/lib/session/dal";
import { revalidatePath } from "next/cache";

export type ApplyResult = { ok: true; updated: number } | { ok: false; message: string };

/** RF07: a decisão final é da liderança — a API só aceita líder do time ou administrador. */
export async function applyRankingAction(teamId: string): Promise<ApplyResult> {
    const session = await verifySession();

    if (isMockMode) return { ok: true, updated: 0 };

    try {
        const updated = await applyRanking(teamId, session.token);

        revalidatePath("/tarefas");
        revalidatePath("/kanban");
        return { ok: true, updated };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}
