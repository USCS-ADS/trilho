import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { ApiError } from "../api/errors";
import { fetchCurrentUser } from "../api/users";
import { initialsOf, roleFromApi } from "../api/mappers";
import type { User } from "../teams";
import { readSession, type Session } from "./index";

/**
 * Data Access Layer de sessão. O `proxy.ts` só faz a checagem otimista (existe
 * cookie válido?); a verificação "de verdade" fica aqui, perto dos dados.
 */

/** Sessão válida ou redireciona para o login. Memoizada por requisição. */
export const verifySession = cache(async (): Promise<Session> => {
    const session = await readSession();
    if (!session) redirect("/login");
    return session;
});

/**
 * Usuário logado (nome, e-mail, perfil), vindo de GET /api/Auth/me. Se a API estiver
 * indisponível, degrada para os dados do token (perfil incluído).
 */
export const getCurrentUser = cache(async (): Promise<User> => {
    const session = await verifySession();
    let sessionRejected = false;

    try {
        return await fetchCurrentUser(session.token, session.userId);
    } catch (error) {
        // 401 = a API não aceita mais este token (expirou, usuário desativado, chave trocada).
        sessionRejected = error instanceof ApiError && error.status === 401;
        // Qualquer outra falha (API fora do ar): segue com o que o token informa.
    }

    // `redirect` lança internamente; por isso fica fora do try/catch.
    if (sessionRejected) redirect("/session-expired");

    return {
        id: session.userId,
        name: session.name || "Usuário",
        initials: initialsOf(session.name),
        email: "",
        role: session.role ? roleFromApi(session.role) : "member",
    };
});
