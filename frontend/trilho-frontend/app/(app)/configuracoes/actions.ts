"use server";

import { toUserMessage } from "@/app/lib/api/errors";
import { isMockMode } from "@/app/lib/api/config";
import { cancelInvite, createInvite } from "@/app/lib/api/invites";
import { fetchCurrentUser, updateUser } from "@/app/lib/api/users";
import { verifySession } from "@/app/lib/session/dal";
import { validate } from "@/app/lib/validation";
import { revalidatePath } from "next/cache";
import type { PendingInvite } from "@/app/lib/teams/types";
import { changeRoleSchema, createInviteSchema, profileSchema } from "./schema";

export type ActionResult = { ok: true } | { ok: false; message: string };

/**
 * RF01: apenas Administradores alteram o perfil de acesso de outros usuários.
 * A checagem fica aqui (servidor) porque esconder o <select> na UI não protege nada.
 */
export async function changeUserRole(userId: string, role: string): Promise<ActionResult> {
    const session = await verifySession();

    // Consulta direta (e não `getCurrentUser`, que degrada para "membro" se a API cair):
    // assim "sem permissão" e "servidor indisponível" têm mensagens diferentes.
    let currentUser;
    try {
        currentUser = await fetchCurrentUser(session.token, session.userId);
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }

    if (currentUser.role !== "admin") {
        return { ok: false, message: "Apenas administradores podem alterar perfis de acesso." };
    }

    const result = validate(changeRoleSchema, { userId, role });
    if (!result.success) return { ok: false, message: Object.values(result.errors)[0] };

    try {
        await updateUser(result.data.userId, { role: result.data.role }, session.token);
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }

    revalidatePath("/configuracoes");
    return { ok: true };
}

/** RF01: cada usuário edita apenas os próprios dados — o id vem da sessão, nunca do cliente. */
export async function updateOwnName(name: string): Promise<ActionResult> {
    const session = await verifySession();

    const result = validate(profileSchema, { name });
    if (!result.success) return { ok: false, message: result.errors.name };

    try {
        await updateUser(session.userId, { name: result.data.name }, session.token);
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }

    revalidatePath("/", "layout");
    return { ok: true };
}

export type InviteResult =
    | { ok: true; invite?: PendingInvite }
    | { ok: false; message: string };

/**
 * RF01: sem autocadastro — convidar é com administrador (qualquer time/perfil) ou líder
 * (só o próprio time, perfil Membro). A API aplica essas regras; aqui só validamos o formato.
 * No modo demonstração devolve `ok` sem convite e o cliente o mantém só na tela.
 */
export async function inviteUserAction(input: unknown): Promise<InviteResult> {
    const session = await verifySession();

    const result = validate(createInviteSchema([]), input);
    if (!result.success) return { ok: false, message: Object.values(result.errors)[0] };

    if (isMockMode) return { ok: true };

    try {
        const invite = await createInvite(
            { ...result.data, email: result.data.email.toLowerCase() },
            session.token,
        );

        revalidatePath("/configuracoes");
        return { ok: true, invite };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}

export async function cancelInviteAction(inviteId: string): Promise<ActionResult> {
    const session = await verifySession();

    if (isMockMode || inviteId.startsWith("local-")) return { ok: true };

    try {
        await cancelInvite(inviteId, session.token);
        revalidatePath("/configuracoes");
        return { ok: true };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}
