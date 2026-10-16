"use client";

import { Button } from "@/app/components/button";
import { PlusIcon } from "@/app/components/icons";
import { PageHeader } from "@/app/components/page-header";
import { WEBHOOK_EVENTS } from "@/app/lib/git-integrations/meta";
import type { ConnectRepositoryInput, GitRepository } from "@/app/lib/git-integrations/types";
import { useRef, useState } from "react";
import { ConfigureRepositoryModal } from "../configure-repository-modal";
import { ConnectRepositoryModal } from "../connect-repository-modal";
import { RepositoryRow } from "../repository-row";

interface IntegrationsWorkspaceProps {
    initialRepositories: GitRepository[];
    teams: { id: string; name: string }[];
}

/** Estado compartilhado entre o botão do cabeçalho, os modais e a lista de repositórios. */
export function IntegrationsWorkspace({ initialRepositories, teams }: IntegrationsWorkspaceProps) {
    const [repositories, setRepositories] = useState(initialRepositories);
    const [isConnectOpen, setIsConnectOpen] = useState(false);
    const [configuringId, setConfiguringId] = useState<string | undefined>();
    const localIdCounter = useRef(0);

    const configuring = repositories.find((repository) => repository.id === configuringId);

    function handleConnect(input: ConnectRepositoryInput) {
        // TODO: chamar a API de conexão; por enquanto o repositório só existe no cliente.
        localIdCounter.current += 1;
        setRepositories((previous) => [
            ...previous,
            {
                id: `local-repo-${localIdCounter.current}`,
                provider: input.provider,
                fullName: input.fullName,
                teamId: input.teamId,
                status: "connected",
                lastSync: "agora",
                events: [...WEBHOOK_EVENTS],
            },
        ]);
    }

    function updateRepository(repositoryId: string, changes: Partial<GitRepository>) {
        setRepositories((previous) =>
            previous.map((repository) =>
                repository.id === repositoryId ? { ...repository, ...changes } : repository,
            ),
        );
    }

    return (
        <>
            <PageHeader
                title="Integrações Git"
                description="Repositórios conectados por time"
                actions={
                    <Button
                        type="button"
                        className="gap-1.5 text-sm"
                        onClick={() => setIsConnectOpen(true)}
                    >
                        <PlusIcon className="h-4 w-4" />
                        Conectar repositório
                    </Button>
                }
            />

            <div className="p-8">
                {repositories.length === 0 ? (
                    <p className="rounded-xl border border-trilho-border bg-trilho-surface px-4 py-6 text-center text-sm text-trilho-dim">
                        Nenhum repositório conectado ainda.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {repositories.map((repository) => (
                            <RepositoryRow
                                key={repository.id}
                                repository={repository}
                                teamName={
                                    teams.find((team) => team.id === repository.teamId)?.name ?? "—"
                                }
                                onConfigure={() => setConfiguringId(repository.id)}
                            />
                        ))}
                    </ul>
                )}

                <p className="mt-4 text-sm text-trilho-dim">
                    Webhooks configurados para eventos de{" "}
                    <strong className="text-trilho-text">commit</strong>,{" "}
                    <strong className="text-trilho-text">pull request</strong> e{" "}
                    <strong className="text-trilho-text">merge</strong>.
                </p>
            </div>

            <ConnectRepositoryModal
                open={isConnectOpen}
                onClose={() => setIsConnectOpen(false)}
                onConnect={handleConnect}
                teams={teams}
            />

            <ConfigureRepositoryModal
                repository={configuring}
                teams={teams}
                onClose={() => setConfiguringId(undefined)}
                onSave={(repositoryId, settings) => updateRepository(repositoryId, settings)}
                onRetrySync={(repositoryId) =>
                    // TODO: disparar nova sincronização via API.
                    updateRepository(repositoryId, { status: "connected", lastSync: "agora" })
                }
                onDisconnect={(repositoryId) =>
                    setRepositories((previous) =>
                        previous.filter((repository) => repository.id !== repositoryId),
                    )
                }
            />
        </>
    );
}
