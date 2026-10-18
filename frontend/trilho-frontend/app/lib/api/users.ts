import "server-only";
import { listUsers as listMockUsers, type User, type UserRole } from "../teams";
import { apiFetch, apiFetchRaw } from "./client";
import { isMockMode } from "./config";
import type {
    RequestChangePasswordJson,
    RequestUserJson,
    RequestUserStatusJson,
    ResponseUserJson,
} from "./dtos";
import { ApiError } from "./errors";
import { roleToApi, userFromApi } from "./mappers";

const USERS_PAGE_SIZE = 200;

/**
 * Usuário logado (GET /api/Auth/me). Qualquer perfil pode chamar; é a fonte
 * confiável de nome, e-mail e perfil (o token só leva id/nome/perfil no momento do login).
 */
export async function fetchCurrentUser(token: string, mockUserId?: string): Promise<User> {
    if (isMockMode) {
        const user = listMockUsers().find((candidate) => candidate.id === mockUserId);
        if (!user) throw new ApiError(401, ["Sessão inválida."]);
        return user;
    }

    const user = await apiFetch<ResponseUserJson>("/api/Auth/me", { token });
    if (!user) throw new ApiError(502, []);
    return userFromApi(user);
}

/**
 * Lista todos os usuários (GET /api/User, só líder/administrador). A API pagina:
 * percorre as páginas até o total informado em `X-Total-Count`.
 */
export async function fetchUsers(token: string): Promise<User[]> {
    if (isMockMode) return listMockUsers();

    const users: User[] = [];

    for (let page = 1; ; page += 1) {
        const response = await apiFetchRaw<ResponseUserJson[]>(
            `/api/User?page=${page}&pageSize=${USERS_PAGE_SIZE}`,
            { token },
        );

        const chunk = response.data ?? [];
        users.push(...chunk.map(userFromApi));

        const total = Number(response.headers.get("X-Total-Count") ?? users.length);
        if (chunk.length === 0 || users.length >= total) break;
    }

    return users;
}

/** GET /api/User/{id} — `undefined` quando o usuário não existe (404). */
export async function fetchUserById(userId: string, token: string): Promise<User | undefined> {
    if (isMockMode) return listMockUsers().find((user) => user.id === userId);

    try {
        const user = await apiFetch<ResponseUserJson>(`/api/User/${encodeURIComponent(userId)}`, {
            token,
        });
        return user ? userFromApi(user) : undefined;
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return undefined;
        throw error;
    }
}

/**
 * Altera nome e/ou perfil de acesso. O PUT exige nome, e-mail e perfil, então relê o
 * usuário e reenvia os dados atuais com a senha vazia — o backend mantém a senha
 * existente (`UpdateUserUseCase`). Regras no servidor: só admin altera perfil, e quem
 * lidera um time não perde o perfil de líder/administrador.
 */
export async function updateUser(
    userId: string,
    changes: { name?: string; role?: UserRole },
    token: string,
) {
    if (isMockMode) return;

    const current = await fetchUserById(userId, token);
    if (!current) throw new ApiError(404, ["Usuário não encontrado."]);

    const body: RequestUserJson = {
        name: changes.name ?? current.name,
        email: current.email,
        password: "",
        role: roleToApi(changes.role ?? current.role),
    };

    await apiFetch<undefined>(`/api/User/${encodeURIComponent(userId)}`, {
        method: "PUT",
        body,
        token,
    });
}

/** POST /api/User (só administrador): cria o usuário já ativo, com a senha informada. */
export async function createUser(
    input: { name: string; email: string; password: string; role: UserRole },
    token: string,
): Promise<User> {
    if (isMockMode) throw new ApiError(400, ["Indisponível no modo demonstração."]);

    const body: RequestUserJson = { ...input, role: roleToApi(input.role) };
    const created = await apiFetch<ResponseUserJson>("/api/User", { method: "POST", body, token });
    if (!created) throw new ApiError(502, []);

    return userFromApi(created);
}

/**
 * PUT /api/User/{id}/status (só administrador). Desativar bloqueia o login e derruba o token
 * em uso, mas preserva o histórico; a API recusa desativar a si mesmo e quem lidera um time.
 */
export async function setUserActive(userId: string, isActive: boolean, token: string) {
    if (isMockMode) return;

    const body: RequestUserStatusJson = { isActive };
    await apiFetch<undefined>(`/api/User/${encodeURIComponent(userId)}/status`, {
        method: "PUT",
        body,
        token,
    });
}

/** DELETE /api/User/{id} (só administrador) — a API recusa excluir a si mesmo e quem lidera um time. */
export async function deleteUser(userId: string, token: string) {
    if (isMockMode) return;

    await apiFetch<undefined>(`/api/User/${encodeURIComponent(userId)}`, { method: "DELETE", token });
}

/**
 * PUT /api/User/change-password — troca a senha de quem está logado, exigindo a senha atual.
 * A API derruba as demais sessões e devolve um token novo para a sessão atual continuar valendo.
 */
export async function changePassword(input: RequestChangePasswordJson, token: string): Promise<string | undefined> {
    if (isMockMode) return undefined;

    const response = await apiFetch<{ token: string }>("/api/User/change-password", { method: "PUT", body: input, token });
    return response?.token;
}
