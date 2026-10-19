"use server";

import { isMockMode } from "@/app/lib/api/config";
import {
    addTeamMember,
    archiveTeam,
    changeTeamLeader,
    createTeam,
    deleteTeam,
    fetchTeamById,
    removeTeamMember,
    restoreTeam,
    updateTeam,
} from "@/app/lib/api/teams";
import { fetchCurrentUser } from "@/app/lib/api/users";
import { toUserMessage } from "@/app/lib/api/errors";
import { verifySession } from "@/app/lib/session/dal";
import type { NewTeamInput, TeamWithMembers } from "@/app/lib/teams/types";
import { validate } from "@/app/lib/validation";
import { revalidatePath } from "next/cache";
import { manageTeamSchema } from "./manage-team-modal/schema";
import { newTeamSchema } from "./new-team-modal/schema";

export type CreateTeamResult =
    | { ok: true; team: TeamWithMembers }
    | { ok: false; message: string };

/**
 * RF02: só administradores criam times. A checagem é no servidor (esconder o
 * botão não protege nada) e o backend repete a regra com 403.
 */
export async function createTeamAction(input: NewTeamInput): Promise<CreateTeamResult> {
    const session = await verifySession();

    const result = validate(newTeamSchema, input);
    if (!result.success) return { ok: false, message: Object.values(result.errors)[0] };

    try {
        const currentUser = await fetchCurrentUser(session.token, session.userId);

        if (currentUser.role !== "admin") {
            return { ok: false, message: "Apenas administradores podem criar times." };
        }

        const team = await createTeam(result.data, session.token);

        revalidatePath("/times");
        return { ok: true, team };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}

export type TeamActionResult =
    | { ok: true; team?: TeamWithMembers }
    | { ok: false; message: string };

/**
 * Executa uma alteração no time e devolve o time atualizado (com membros e carga). As regras de
 * permissão e de negócio são as da API (admin/líder, líder não removível, time com tarefas não
 * exclui...): a mensagem do servidor volta tal qual para a tela.
 */
async function runTeamAction(
    teamId: string,
    action: (token: string) => Promise<void>,
    { returnTeam = true }: { returnTeam?: boolean } = {},
): Promise<TeamActionResult> {
    const session = await verifySession();

    if (isMockMode) {
        return { ok: false, message: "Esta ação exige a API ligada (o modo demonstração é somente leitura)." };
    }

    try {
        await action(session.token);

        revalidatePath("/times");
        revalidatePath("/kanban");

        if (!returnTeam) return { ok: true };

        const team = await fetchTeamById(teamId, session.token);
        return { ok: true, team };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}

export async function updateTeamAction(
    teamId: string,
    input: { name: string; description: string },
): Promise<TeamActionResult> {
    const result = validate(manageTeamSchema, input);
    if (!result.success) return { ok: false, message: Object.values(result.errors)[0] };

    return runTeamAction(teamId, (token) => updateTeam(teamId, result.data, token));
}

export async function addTeamMemberAction(teamId: string, userId: string): Promise<TeamActionResult> {
    return runTeamAction(teamId, (token) => addTeamMember(teamId, userId, token));
}

export async function removeTeamMemberAction(teamId: string, userId: string): Promise<TeamActionResult> {
    return runTeamAction(teamId, (token) => removeTeamMember(teamId, userId, token));
}

export async function changeTeamLeaderAction(teamId: string, leaderId: string): Promise<TeamActionResult> {
    return runTeamAction(teamId, (token) => changeTeamLeader(teamId, leaderId, token));
}

export async function archiveTeamAction(teamId: string): Promise<TeamActionResult> {
    return runTeamAction(teamId, (token) => archiveTeam(teamId, token));
}

export async function restoreTeamAction(teamId: string): Promise<TeamActionResult> {
    return runTeamAction(teamId, (token) => restoreTeam(teamId, token));
}

export async function deleteTeamAction(teamId: string): Promise<TeamActionResult> {
    return runTeamAction(teamId, (token) => deleteTeam(teamId, token), { returnTeam: false });
}
