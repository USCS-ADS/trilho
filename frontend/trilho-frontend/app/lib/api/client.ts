import "server-only";
import { getApiUrl } from "./config";
import { ApiError } from "./errors";

interface ApiFetchOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    /** JWT da sessão; enviado como Bearer (a API valida em todas as rotas protegidas). */
    token?: string;
}

interface ErrorPayload {
    errorMessages?: string[];
}

export interface ApiResponse<T> {
    status: number;
    /** `undefined` em respostas sem corpo (204). */
    data: T | undefined;
    headers: Headers;
}

/**
 * Cliente HTTP do backend .NET. Lança `ApiError` em respostas não-2xx
 * (formato `ResponseErrorJson`) ou falha de rede. Use `apiFetch` para o corpo
 * e `apiFetchRaw` quando precisar dos cabeçalhos (ex: `X-Total-Count`).
 */
export async function apiFetchRaw<T>(
    path: string,
    { method = "GET", body, token }: ApiFetchOptions = {},
): Promise<ApiResponse<T>> {
    let response: Response;

    try {
        response = await fetch(`${getApiUrl()}${path}`, {
            method,
            headers: {
                Accept: "application/json",
                // O backend escolhe a cultura (mensagens de erro) por este header.
                "Accept-Language": "pt-BR",
                ...(body !== undefined && { "Content-Type": "application/json" }),
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
            cache: "no-store",
        });
    } catch {
        throw new ApiError(0, ["Não foi possível conectar ao servidor."]);
    }

    if (response.status === 204) {
        return { status: 204, data: undefined, headers: response.headers };
    }

    const payload: unknown = await response.json().catch(() => undefined);

    if (!response.ok) {
        const messages = (payload as ErrorPayload | undefined)?.errorMessages;
        throw new ApiError(response.status, messages?.length ? messages : []);
    }

    return { status: response.status, data: payload as T, headers: response.headers };
}

/** Devolve o corpo (ou `undefined` em 204). */
export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T | undefined> {
    return (await apiFetchRaw<T>(path, options)).data;
}
