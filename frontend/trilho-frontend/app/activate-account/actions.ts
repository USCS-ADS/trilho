"use server";

import { isMockMode } from "@/app/lib/api/config";
import { acceptInvite } from "@/app/lib/api/invites";
import { toUserMessage } from "@/app/lib/api/errors";
import { validate } from "@/app/lib/validation";
import { redirect } from "next/navigation";
import { activateAccountSchema } from "./schema";

export type ActivateResult = { ok: false; message: string };

/**
 * Ativa a conta a partir do token do convite (anônimo, protegido pelo próprio token de uso único).
 * Em caso de sucesso redireciona ao login; só devolve valor quando há erro.
 */
export async function activateAccountAction(
    inviteToken: string,
    fullName: string,
    password: string,
): Promise<ActivateResult> {
    const result = validate(activateAccountSchema, { fullName, password });
    if (!result.success) return { ok: false, message: Object.values(result.errors)[0] };

    if (!isMockMode) {
        try {
            await acceptInvite(inviteToken, result.data.fullName, result.data.password);
        } catch (error) {
            return { ok: false, message: toUserMessage(error) };
        }
    }

    // `redirect` lança internamente; por isso fica fora do try/catch.
    redirect("/login?activated=1");
}
