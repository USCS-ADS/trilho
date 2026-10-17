import "server-only";
import { listTeamsWithMembers, type NewTeamInput, type TeamWithMembers } from "../teams";
import { apiFetch } from "./client";
import { isMockMode } from "./config";
import type { RequestTeamJson, ResponseTeamJson } from "./dtos";
import { ApiError } from "./errors";
import { teamFromApi } from "./mappers";

/**
 * GET /api/Team — administrador vê todos; os demais, os times de que participam (204 vira lista vazia).
 * Arquivados ficam de fora, salvo `includeArchived` (usado só na tela de gerenciamento de times).
 */
export async function fetchTeams(
    token: string,
    { includeArchived = false }: { includeArchived?: boolean } = {},
): Promise<TeamWithMembers[]> {
    if (isMockMode) return listTeamsWithMembers();

    const teams = await apiFetch<ResponseTeamJson[]>(
        `/api/Team${includeArchived ? "?includeArchived=true" : ""}`,
        { token },
    );
    return (teams ?? []).map(teamFromApi);
}

/** GET /api/Team/{id} — `undefined` quando não existe (404) ou o usuário não participa (403). */
export async function fetchTeamById(teamId: string, token: string): Promise<TeamWithMembers | undefined> {
    if (isMockMode) return listTeamsWithMembers().find((team) => team.id === teamId);

    try {
        const team = await apiFetch<ResponseTeamJson>(`/api/Team/${encodeURIComponent(teamId)}`, { token });
        return team ? teamFromApi(team) : undefined;
    } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 403)) return undefined;
        throw error;
    }
}

/**
 * Cria o time (líder vira membro automaticamente) e adiciona os demais membros.
 * Devolve o time já com líder, membros e carga calculados pelo backend.
 */
export async function createTeam(input: NewTeamInput, token: string): Promise<TeamWithMembers> {
    if (isMockMode) {
        throw new ApiError(400, ["Criar times exige a API ligada (modo demonstração é somente leitura)."]);
    }

    const body: RequestTeamJson = {
        name: input.name,
        description: input.description,
        leaderId: Number(input.leaderId),
    };

    const created = await apiFetch<ResponseTeamJson>("/api/Team", { method: "POST", body, token });
    if (!created) throw new ApiError(502, []);

    for (const memberId of input.memberIds) {
        if (memberId === input.leaderId) continue;

        await apiFetch<undefined>(`/api/Team/${created.id}/member`, {
            method: "POST",
            body: { userId: Number(memberId) },
            token,
        });
    }

    const team = await fetchTeamById(String(created.id), token);
    return team ?? teamFromApi(created);
}

function teamPath(teamId: string, suffix = "") {
    return `/api/Team/${encodeURIComponent(teamId)}${suffix}`;
}

/** PUT /api/Team/{id} — nome e descrição (administrador ou líder do time; 409 se arquivado). */
export async function updateTeam(
    teamId: string,
    changes: { name: string; description: string },
    token: string,
) {
    await apiFetch<undefined>(teamPath(teamId), { method: "PUT", body: changes, token });
}

export async function addTeamMember(teamId: string, userId: string, token: string) {
    await apiFetch<undefined>(teamPath(teamId, "/member"), {
        method: "POST",
        body: { userId: Number(userId) },
        token,
    });
}

/** Remove um membro; o líder não pode ser removido (409) — troque o líder antes. */
export async function removeTeamMember(teamId: string, userId: string, token: string) {
    await apiFetch<undefined>(teamPath(teamId, `/member/${encodeURIComponent(userId)}`), {
        method: "DELETE",
        token,
    });
}

/** PUT /api/Team/{id}/leader — só administrador; o líder anterior continua como membro. */
export async function changeTeamLeader(teamId: string, leaderId: string, token: string) {
    await apiFetch<undefined>(teamPath(teamId, "/leader"), {
        method: "PUT",
        body: { leaderId: Number(leaderId) },
        token,
    });
}

export async function archiveTeam(teamId: string, token: string) {
    await apiFetch<undefined>(teamPath(teamId, "/archive"), { method: "POST", token });
}

/** 409 se o líder já lidera outro time ativo. */
export async function restoreTeam(teamId: string, token: string) {
    await apiFetch<undefined>(teamPath(teamId, "/restore"), { method: "POST", token });
}

/** DELETE /api/Team/{id} — 409 se houver tarefas (a API orienta a arquivar). */
export async function deleteTeam(teamId: string, token: string) {
    await apiFetch<undefined>(teamPath(teamId), { method: "DELETE", token });
}
