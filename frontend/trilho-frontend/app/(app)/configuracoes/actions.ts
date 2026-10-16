"use server";

import { toUserMessage } from "@/app/lib/api/errors";
import { fetchCurrentUser, updateUser } from "@/app/lib/api/users";
import { verifySession } from "@/app/lib/session/dal";
import { validate } from "@/app/lib/validation";
import { revalidatePath } from "next/cache";
import { changeRoleSchema, profileSchema } from "./schema";

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
