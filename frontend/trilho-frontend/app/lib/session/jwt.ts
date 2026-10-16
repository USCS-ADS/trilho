/**
 * Leitura (sem verificação de assinatura) do JWT emitido pelo backend. Serve só
 * para saber *quem* e *até quando* — a chave de assinatura vive no servidor da
 * API, que é quem deve validar o token em cada requisição.
 */

export interface TokenPayload {
    /** Id numérico do usuário — o mesmo usado nas rotas da API (api/User/{id}). */
    userId: string;
    name: string;
    /** Perfil gravado no token (ex: "administrador"); só para decisões otimistas de UI. */
    role?: string;
    /** Epoch em ms; ausente se o token não tiver `exp`. */
    expiresAt?: number;
}

// O backend emite o id numérico no claim "id" (o "sid" é um Guid, não serve nas rotas).
// `sid` fica como último recurso para tokens antigos/do modo demonstração.
const ID_CLAIMS = ["id", "sid", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"];
const NAME_CLAIMS = [
    "unique_name",
    "name",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
];
const ROLE_CLAIMS = ["role", "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

function firstClaim(payload: Record<string, unknown>, keys: string[]): string | undefined {
    for (const key of keys) {
        const value = payload[key];
        if (typeof value === "string" || typeof value === "number") return String(value);
    }
    return undefined;
}

export function decodeToken(token: string): TokenPayload | null {
    try {
        const [, encodedPayload] = token.split(".");
        if (!encodedPayload) return null;

        const payload = JSON.parse(
            Buffer.from(encodedPayload, "base64url").toString("utf8"),
        ) as Record<string, unknown>;

        const userId = firstClaim(payload, ID_CLAIMS);
        if (!userId) return null;

        return {
            userId,
            name: firstClaim(payload, NAME_CLAIMS) ?? "",
            role: firstClaim(payload, ROLE_CLAIMS),
            expiresAt: typeof payload.exp === "number" ? payload.exp * 1000 : undefined,
        };
    } catch {
        return null;
    }
}

export function isTokenActive(payload: TokenPayload | null): payload is TokenPayload {
    if (payload === null) return false;
    return payload.expiresAt === undefined || payload.expiresAt > Date.now();
}
