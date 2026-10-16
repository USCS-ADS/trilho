import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./constants";
import { decodeToken, isTokenActive, type TokenPayload } from "./jwt";

export interface Session extends TokenPayload {
    token: string;
}

/** Grava o JWT num cookie httpOnly (inacessível ao JavaScript do navegador). */
export async function createSession(token: string) {
    const payload = decodeToken(token);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: payload?.expiresAt ? new Date(payload.expiresAt) : undefined,
    });
}

/** Sessão atual, ou `null` se não houver cookie / o token estiver expirado ou ilegível. */
export async function readSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = decodeToken(token);
    return isTokenActive(payload) ? { ...payload, token } : null;
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}
