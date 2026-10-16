import "server-only";

/**
 * Configuração da camada de API. Só roda no servidor: o backend não habilita
 * CORS, e o token de sessão nunca deve chegar ao JavaScript do navegador.
 */

const apiUrl = process.env.API_URL?.replace(/\/+$/, "");
const forcedMock = process.env.USE_MOCK_API === "true";

/**
 * Modo demonstração: login e usuários simulados, sem backend. Só vale fora de
 * produção — em produção sem `API_URL`, as chamadas falham em vez de simular
 * autenticação.
 */
export const isMockMode =
    process.env.NODE_ENV !== "production" && (forcedMock || apiUrl === undefined);

export function getApiUrl(): string {
    if (!apiUrl) {
        throw new Error("API_URL não configurada. Defina a variável de ambiente (ver .env.example).");
    }
    return apiUrl;
}
