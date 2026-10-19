import "server-only";
import type { NewInviteInput, PendingInvite } from "../teams/types";
import { apiFetch } from "./client";
import { isMockMode } from "./config";
import type { RequestInviteJson, ResponseInviteJson, ResponseInviteLookupJson } from "./dtos";
import { ApiError } from "./errors";
import { roleFromApi, roleToApi } from "./mappers";

export interface InviteLookup {
    fullName: string;
    email: string;
    teamName: string;
}

function inviteFromApi(dto: ResponseInviteJson): PendingInvite {
    return {
        id: String(dto.id),
        fullName: dto.fullName,
        email: dto.email,
        teamId: String(dto.teamId),
        role: roleFromApi(dto.role),
    };
}

/** POST /api/Invite — cria (ou reenvia) o convite; o link de ativação segue por e-mail. */
export async function createInvite(input: NewInviteInput, token: string): Promise<PendingInvite> {
    const body: RequestInviteJson = {
        email: input.email,
        fullName: input.fullName,
        teamId: Number(input.teamId),
        role: roleToApi(input.role),
    };

    const created = await apiFetch<ResponseInviteJson>("/api/Invite", { method: "POST", body, token });
    if (!created) throw new ApiError(502, []);

    return inviteFromApi(created);
}

/** GET /api/Invite — convites pendentes (administrador: todos; líder: dos seus times). */
export async function fetchPendingInvites(token: string): Promise<PendingInvite[]> {
    if (isMockMode) return [];

    const invites = await apiFetch<ResponseInviteJson[]>("/api/Invite", { token });
    return (invites ?? []).map(inviteFromApi);
}

export async function cancelInvite(inviteId: string, token: string) {
    await apiFetch<undefined>(`/api/Invite/${encodeURIComponent(inviteId)}`, { method: "DELETE", token });
}

/**
 * Dados do convite para a tela de ativação. O token vai no corpo (não na URL da API)
 * para não aparecer em logs de acesso. `undefined` = inválido, usado, cancelado ou expirado.
 */
export async function lookupInvite(inviteToken: string): Promise<InviteLookup | undefined> {
    try {
        const invite = await apiFetch<ResponseInviteLookupJson>("/api/Invite/lookup", {
            method: "POST",
            body: { token: inviteToken },
        });

        return invite
            ? { fullName: invite.fullName, email: invite.email, teamName: invite.teamName }
            : undefined;
    } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return undefined;
        throw error;
    }
}

/** POST /api/Invite/accept — cria o usuário com o perfil do convite e o coloca no time. */
export async function acceptInvite(inviteToken: string, fullName: string, password: string) {
    await apiFetch<unknown>("/api/Invite/accept", {
        method: "POST",
        body: { token: inviteToken, fullName, password },
    });
}
