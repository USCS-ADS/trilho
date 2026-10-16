import "server-only";
import { listUsers } from "../teams";
import type { User } from "../teams";
import { ApiError } from "./errors";
import { roleToApi } from "./mappers";

const MOCK_SESSION_HOURS = 8;

function base64Url(value: object) {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
}

/**
 * Token NÃO assinado, no mesmo formato de claims do backend. Só existe no modo
 * demonstração, para exercitar o mesmo caminho de sessão sem a API no ar.
 */
export function createMockToken(user: User): string {
    const header = base64Url({ alg: "none", typ: "JWT" });
    const payload = base64Url({
        id: user.id,
        unique_name: user.name,
        role: roleToApi(user.role),
        exp: Math.floor(Date.now() / 1000) + MOCK_SESSION_HOURS * 60 * 60,
    });

    return `${header}.${payload}.`;
}

/** No modo demonstração qualquer senha válida entra; o e-mail precisa ser de um usuário do mock. */
export function mockLogin(email: string) {
    const user = listUsers().find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        throw new ApiError(401, ["E-mail ou senha inválidos."]);
    }

    return { name: user.name, token: createMockToken(user) };
}
