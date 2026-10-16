export type GitProvider = "github" | "gitlab";
export type GitSyncStatus = "connected" | "error";

/** Eventos do provedor que o webhook do Trilho escuta (RF06). */
export type GitWebhookEvent = "commit" | "pull_request" | "merge";

export interface GitRepository {
    id: string;
    provider: GitProvider;
    /** "dono/repositório", como aparece no provedor. */
    fullName: string;
    teamId: string;
    status: GitSyncStatus;
    /** Texto relativo já formatado (ex: "há 4 minutos"); virá do backend. */
    lastSync: string;
    events: GitWebhookEvent[];
}

export interface ConnectRepositoryInput {
    provider: GitProvider;
    fullName: string;
    teamId: string;
}
