import "server-only";
import { apiFetch } from "./client";
import type { ResponseApplyRankingJson, ResponseRankedTaskJson } from "./dtos";

/** GET /api/Prioritization/ranking — tarefas em aberto do time, com prioridade sugerida e justificativa. */
export async function fetchRanking(teamId: string, token: string): Promise<ResponseRankedTaskJson[]> {
    const ranking = await apiFetch<ResponseRankedTaskJson[]>(
        `/api/Prioritization/ranking?teamId=${encodeURIComponent(teamId)}`,
        { token },
    );

    return ranking ?? [];
}

/** POST /api/Prioritization/apply — líder do time ou administrador; urgente declarada nunca é rebaixada. */
export async function applyRanking(teamId: string, token: string): Promise<number> {
    const result = await apiFetch<ResponseApplyRankingJson>("/api/Prioritization/apply", {
        method: "POST",
        body: { teamId: Number(teamId) },
        token,
    });

    return result?.updated ?? 0;
}
