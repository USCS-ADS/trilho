import { SESSION_COOKIE_NAME } from "@/app/lib/session/constants";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Destino do redirecionamento quando a API recusa o token da sessão (401): expirado, revogado,
 * usuário desativado ou chave trocada. Apaga o cookie e leva ao login com um aviso.
 */
export function GET(request: NextRequest) {
    const response = NextResponse.redirect(new URL("/login?expired=1", request.nextUrl));
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
}
