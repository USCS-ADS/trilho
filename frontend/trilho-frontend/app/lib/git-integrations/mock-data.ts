import type { GitRepository } from "./types";

// Dados do MODO DEMONSTRAÇÃO (sem API_URL). Com a API ligada, vêm de GET /api/GitRepository.

export const REPOSITORIES: GitRepository[] = [
    {
        id: "repo-backend",
        provider: "github",
        fullName: "trilho/backend",
        teamId: "backend",
        status: "connected",
        lastSync: "há 4 minutos",
        events: ["commit", "pull_request", "merge"],
    },
    {
        id: "repo-frontend",
        provider: "github",
        fullName: "trilho/frontend",
        teamId: "frontend",
        status: "connected",
        lastSync: "há 12 minutos",
        events: ["commit", "pull_request", "merge"],
    },
    {
        id: "repo-data-pipelines",
        provider: "gitlab",
        fullName: "trilho/data-pipelines",
        teamId: "dados",
        status: "connected",
        lastSync: "há 1 hora",
        events: ["commit", "pull_request", "merge"],
    },
    {
        id: "repo-ml-models",
        provider: "github",
        fullName: "trilho/ml-models",
        teamId: "machine-learning",
        status: "error",
        lastSync: "há 2 dias",
        events: ["commit", "pull_request", "merge"],
    },
];
