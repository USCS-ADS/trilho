import "server-only";
import { apiFetch } from "./client";
import { isMockMode } from "./config";
import type { RequestUserLoginJson, ResponseUserLoginJson } from "./dtos";
import { ApiError } from "./errors";
import { mockLogin } from "./mock-auth";

/** POST /api/Auth — devolve nome e JWT; 401 com `errorMessages` se as credenciais forem inválidas. */
export async function login(credentials: RequestUserLoginJson): Promise<ResponseUserLoginJson> {
    if (isMockMode) return mockLogin(credentials.email);

    const response = await apiFetch<ResponseUserLoginJson>("/api/Auth", {
        method: "POST",
        body: credentials,
    });

    if (!response?.token) throw new ApiError(502, []);
    return response;
}
