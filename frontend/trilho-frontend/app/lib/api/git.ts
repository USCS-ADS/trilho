import "server-only";
import { formatRelative } from "../date";
import { listRepositories } from "../git-integrations";
import type {
    ConnectRepositoryInput,
    GitProvider,
    GitRepository,
    GitWebhookEvent,
    WebhookSetup,
} from "../git-integrations/types";
import { apiFetch } from "./client";
import { getApiUrl, isMockMode } from "./config";
import type { ResponseGitRepositoryJson, ResponseGitRunJson } from "./dtos";
import { ApiError } from "./errors";

/** O backend devolve só o caminho quando `PublicApiBaseUrl` não está configurada: completa com a URL da API. */
function absoluteWebhookUrl(url: string) {
    return url.startsWith("/") ? `${getApiUrl()}${url}` : url;
}

function repositoryFromApi(dto: ResponseGitRepositoryJson): GitRepository {
    return {
        id: String(dto.id),
        provider: dto.provider as GitProvider,
        fullName: dto.fullName,
        teamId: String(dto.teamId),
        status: dto.status === "error" ? "error" : "connected",
        lastSync: dto.lastSyncAt ? formatRelative(dto.lastSyncAt) : "nunca",
        events: dto.events as GitWebhookEvent[],
        pendingEvents: dto.pendingEvents,
        webhookUrl: absoluteWebhookUrl(dto.webhookUrl),
    };
}

/** GET /api/GitRepository — repositórios dos times do usuário (204 vira lista vazia). */
export async function fetchRepositories(token: string): Promise<GitRepository[]> {
    if (isMockMode) return listRepositories();

    const repositories = await apiFetch<ResponseGitRepositoryJson[]>("/api/GitRepository", { token });
    return (repositories ?? []).map(repositoryFromApi);
}

/** POST /api/GitRepository — devolve também a URL e o segredo do webhook, que só aparecem agora. */
export async function connectRepository(
    input: ConnectRepositoryInput,
    token: string,
): Promise<{ repository: GitRepository; webhook: WebhookSetup }> {
    const created = await apiFetch<ResponseGitRepositoryJson>("/api/GitRepository", {
        method: "POST",
        body: { provider: input.provider, fullName: input.fullName, teamId: Number(input.teamId) },
        token,
    });
    if (!created?.webhookSecret) throw new ApiError(502, []);

    const repository = repositoryFromApi(created);

    return { repository, webhook: { url: repository.webhookUrl ?? "", secret: created.webhookSecret } };
}

export async function updateRepositoryEvents(repositoryId: string, events: GitWebhookEvent[], token: string) {
    await apiFetch<undefined>(`/api/GitRepository/${encodeURIComponent(repositoryId)}`, {
        method: "PUT",
        body: { events },
        token,
    });
}

/** POST .../retry — reprocessa a fila do repositório ("Sincronizar agora"). */
export async function retryRepository(repositoryId: string, token: string) {
    return apiFetch<ResponseGitRunJson>(`/api/GitRepository/${encodeURIComponent(repositoryId)}/retry`, {
        method: "POST",
        token,
    });
}

export async function disconnectRepository(repositoryId: string, token: string) {
    await apiFetch<undefined>(`/api/GitRepository/${encodeURIComponent(repositoryId)}`, {
        method: "DELETE",
        token,
    });
}
