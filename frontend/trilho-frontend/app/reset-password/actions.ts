"use server";

import { toUserMessage } from "@/app/lib/api/errors";
import {
    confirmPasswordReset,
    requestPasswordReset,
    verifyResetCode,
} from "@/app/lib/api/password-reset";
import { validate } from "@/app/lib/validation";
import { redirect } from "next/navigation";
import { clearResetFlow, readResetFlow, writeResetFlow } from "./flow";
import { newPasswordSchema, requestResetSchema, verifyCodeSchema } from "./schema";

export type FlowError = { ok: false; message: string };
export type ResendResult = { ok: true } | FlowError;

const EXPIRED_MESSAGE = "A solicitação expirou. Peça um novo código.";

/** Passo 1: envia o código. A resposta é a mesma para e-mails não cadastrados (a API não revela). */
export async function requestResetAction(email: string): Promise<FlowError> {
    const result = validate(requestResetSchema, { email });
    if (!result.success) return { ok: false, message: Object.values(result.errors)[0] };

    try {
        await requestPasswordReset(result.data.email);
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }

    await writeResetFlow({ email: result.data.email.toLowerCase() });
    redirect("/reset-password/verify-code");
}

/** Passo 2: confere o código (sem consumi-lo) e guarda para o passo 3. */
export async function verifyCodeAction(code: string): Promise<FlowError> {
    const result = validate(verifyCodeSchema, { code });
    if (!result.success) return { ok: false, message: Object.values(result.errors)[0] };

    const { email } = await readResetFlow();
    if (!email) return { ok: false, message: EXPIRED_MESSAGE };

    try {
        await verifyResetCode(email, result.data.code);
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }

    await writeResetFlow({ email, code: result.data.code });
    redirect("/reset-password/new-password");
}

/** "Reenviar código": novo pedido invalida o anterior no backend. */
export async function resendCodeAction(): Promise<ResendResult> {
    const { email } = await readResetFlow();
    if (!email) return { ok: false, message: EXPIRED_MESSAGE };

    try {
        await requestPasswordReset(email);
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }

    await writeResetFlow({ email });
    return { ok: true };
}

/** Passo 3: define a nova senha (consome o código) e volta ao login. */
export async function confirmResetAction(
    password: string,
    passwordConfirmation: string,
): Promise<FlowError> {
    const result = validate(newPasswordSchema, { password, passwordConfirmation });
    if (!result.success) return { ok: false, message: Object.values(result.errors)[0] };

    const { email, code } = await readResetFlow();
    if (!email || !code) return { ok: false, message: EXPIRED_MESSAGE };

    try {
        await confirmPasswordReset(email, code, result.data.password);
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }

    await clearResetFlow();
    redirect("/login?reset=1");
}
