import { REPOSITORIES } from "./mock-data";
import type { GitRepository } from "./types";

export * from "./meta";
export type * from "./types";

// Costura para a API: hoje lê o mock; na integração, passa a chamar o backend.

export function listRepositories(): GitRepository[] {
    return REPOSITORIES;
}
