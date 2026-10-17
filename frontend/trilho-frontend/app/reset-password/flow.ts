import "server-only";
import { cookies } from "next/headers";

/**
 * Estado do fluxo de redefinição entre os 3 passos (e-mail → código → nova senha), guardado em
 * cookie httpOnly de curta duração restrito a /reset-password. Não é segredo: o backend valida
 * o código a cada chamada; o cookie só evita pedir o e-mail/código de novo a cada tela.
 */
const COOKIE_NAME = "trilho_reset_flow";
const MAX_AGE_SECONDS = 15 * 60;

export interface ResetFlow {
    email?: string;
    /** Presente só depois de o código ser conferido no passo 2. */
    code?: string;
}

export async function readResetFlow(): Promise<ResetFlow> {
    const raw = (await cookies()).get(COOKIE_NAME)?.value;
    if (!raw) return {};

    try {
        const parsed = JSON.parse(raw) as ResetFlow;
        return {
            email: typeof parsed.email === "string" ? parsed.email : undefined,
            code: typeof parsed.code === "string" ? parsed.code : undefined,
        };
    } catch {
        return {};
    }
}

export async function writeResetFlow(flow: ResetFlow) {
    (await cookies()).set(COOKIE_NAME, JSON.stringify(flow), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/reset-password",
        maxAge: MAX_AGE_SECONDS,
    });
}

export async function clearResetFlow() {
    (await cookies()).delete({ name: COOKIE_NAME, path: "/reset-password" });
}
