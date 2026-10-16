import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/app/lib/session/constants";
import { decodeToken, isTokenActive } from "@/app/lib/session/jwt";

/** Rotas que exigem sessão (grupo `app/(app)`). */
const PROTECTED_PREFIXES = [
    "/dashboard",
    "/kanban",
    "/times",
    "/tarefas",
    "/integracoes-git",
    "/configuracoes",
];

function matchesPrefix(pathname: string, prefix: string) {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Checagem OTIMISTA: só olha se existe um token não expirado no cookie, sem
 * consultar a API. A verificação de verdade acontece na camada de acesso a
 * dados (`app/lib/session/dal.ts`) e, principalmente, no backend.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const hasSession = token !== undefined && isTokenActive(decodeToken(token));

    const isProtected = PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));

    if (isProtected && !hasSession) {
        const response = NextResponse.redirect(new URL("/login", request.nextUrl));
        // Token expirado/inválido: limpa o cookie para não ficar redirecionando em loop.
        if (token) response.cookies.delete(SESSION_COOKIE_NAME);
        return response;
    }

    if (pathname === "/login" && hasSession) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    // Fora arquivos estáticos e internos do Next.
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
