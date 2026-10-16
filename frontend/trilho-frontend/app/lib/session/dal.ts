import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
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

    try {
        return await fetchCurrentUser(session.token, session.userId);
    } catch {
        // API indisponível: segue com o que o token informa.
    }

    return {
        id: session.userId,
        name: session.name || "Usuário",
        initials: initialsOf(session.name),
        email: "",
        role: session.role ? roleFromApi(session.role) : "member",
    };
});
