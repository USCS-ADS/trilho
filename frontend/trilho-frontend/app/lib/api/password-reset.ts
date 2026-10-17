import "server-only";
import { apiFetch } from "./client";
import { isMockMode } from "./config";

/** POST /api/PasswordReset/request — resposta idêntica para e-mail inexistente (a API não revela cadastros). */
export async function requestPasswordReset(email: string) {
    if (isMockMode) return;

    await apiFetch<undefined>("/api/PasswordReset/request", { method: "POST", body: { email } });
}

/** POST /api/PasswordReset/verify — confere o código sem consumi-lo; 400 se inválido/expirado. */
export async function verifyResetCode(email: string, code: string) {
    if (isMockMode) return;

    await apiFetch<undefined>("/api/PasswordReset/verify", { method: "POST", body: { email, code } });
}

/** POST /api/PasswordReset/confirm — define a nova senha e consome o código. */
export async function confirmPasswordReset(email: string, code: string, newPassword: string) {
    if (isMockMode) return;

    await apiFetch<undefined>("/api/PasswordReset/confirm", {
        method: "POST",
        body: { email, code, newPassword },
    });
}
