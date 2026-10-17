"use client";

import { Button } from "@/app/components/button";
import { PlusIcon } from "@/app/components/icons";
import { PageHeader } from "@/app/components/page-header";
import { WEBHOOK_EVENTS } from "@/app/lib/git-integrations/meta";
import type {
    ConnectRepositoryInput,
    GitRepository,
    WebhookSetup,
} from "@/app/lib/git-integrations/types";
import { useRef, useState } from "react";
import {
    connectRepositoryAction,
    disconnectRepositoryAction,
    retryRepositoryAction,
    saveRepositoryAction,
} from "../actions";
import { ConfigureRepositoryModal } from "../configure-repository-modal";
import { ConnectRepositoryModal } from "../connect-repository-modal";
import { RepositoryRow } from "../repository-row";

interface IntegrationsWorkspaceProps {
    initialRepositories: GitRepository[];
    teams: { id: string; name: string }[];
    /** Times em que o usuário conecta/configura repositórios (administrador: todos; líder: o próprio). */
    manageableTeamIds: string[];
    loadError?: string;
}

/** Estado compartilhado entre o botão do cabeçalho, os modais e a lista de repositórios. */
export function IntegrationsWorkspace({
    initialRepositories,
    teams,
    manageableTeamIds,
    loadError,
}: IntegrationsWorkspaceProps) {
    const [repositories, setRepositories] = useState(initialRepositories);
    const [isConnectOpen, setIsConnectOpen] = useState(false);
    const [configuringId, setConfiguringId] = useState<string | undefined>();
    const localIdCounter = useRef(0);

    const configuring = repositories.find((repository) => repository.id === configuringId);
    const connectableTeams = teams.filter((team) => manageableTeamIds.includes(team.id));

    function updateRepository(repositoryId: string, changes: Partial<GitRepository>) {
        setRepositories((previous) =>
            previous.map((repository) =>
                repository.id === repositoryId ? { ...repository, ...changes } : repository,
            ),
        );
    }

    /** Devolve o erro (ou a configuração do webhook) para o modal exibir. */
    async function handleConnect(
        input: ConnectRepositoryInput,
    ): Promise<{ error?: string; webhook?: WebhookSetup }> {
        const result = await connectRepositoryAction(input);
        if (!result.ok) return { error: result.message };

        let repository = result.repository;

        if (!repository) {
            // Modo demonstração (sem API): o repositório existe só no cliente.
            localIdCounter.current += 1;
            repository = {
                id: `local-repo-${localIdCounter.current}`,
                provider: input.provider,
                fullName: input.fullName,
                teamId: input.teamId,
                status: "connected",
                lastSync: "agora",
                events: [...WEBHOOK_EVENTS],
            };
        }

        const created = repository;
        setRepositories((previous) => [...previous, created]);

        return { webhook: result.webhook };
    }

    async function handleSave(repositoryId: string, events: GitRepository["events"]) {
        const result = await saveRepositoryAction(repositoryId, events);
        if (!result.ok) return result.message;

        updateRepository(repositoryId, { events });
        return undefined;
    }

    async function handleRetrySync(repositoryId: string) {
        const result = await retryRepositoryAction(repositoryId);
        if (!result.ok) return result.message;

        if (result.repository) {
            updateRepository(repositoryId, result.repository);
        } else {
            updateRepository(repositoryId, { status: "connected", lastSync: "agora" });
        }

        return result.failed > 0 ? "Alguns eventos ainda falharam; tente novamente em instantes." : undefined;
    }

    async function handleDisconnect(repositoryId: string) {
        const result = await disconnectRepositoryAction(repositoryId);
        if (!result.ok) return result.message;

        setRepositories((previous) => previous.filter((repository) => repository.id !== repositoryId));
        return undefined;
    }

    return (
        <>
            <PageHeader
                title="Integrações Git"
                description="Repositórios conectados por time"
                actions={
                    connectableTeams.length > 0 ? (
                        <Button
                            type="button"
                            className="gap-1.5 text-sm"
                            onClick={() => setIsConnectOpen(true)}
                        >
                            <PlusIcon className="h-4 w-4" />
                            Conectar repositório
                        </Button>
                    ) : undefined
                }
            />

            <div className="p-8">
                {loadError && (
                    <p
                        role="alert"
                        className="mb-4 rounded-lg border border-trilho-danger/30 bg-trilho-danger/10 px-3 py-2 text-sm text-trilho-danger"
                    >
                        {loadError}
                    </p>
                )}

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
                                onConfigure={
                                    manageableTeamIds.includes(repository.teamId)
                                        ? () => setConfiguringId(repository.id)
                                        : undefined
                                }
                            />
                        ))}
                    </ul>
                )}

                <p className="mt-4 text-sm text-trilho-dim">
                    Webhooks configurados para eventos de{" "}
                    <strong className="text-trilho-text">commit</strong>,{" "}
                    <strong className="text-trilho-text">pull request</strong> e{" "}
                    <strong className="text-trilho-text">merge</strong>. Cite{" "}
                    <code className="rounded bg-trilho-surface-2 px-1">#123</code> ou{" "}
                    <code className="rounded bg-trilho-surface-2 px-1">task-123</code> na branch, no PR ou
                    no commit para ligar à tarefa.
                </p>
            </div>

            <ConnectRepositoryModal
                open={isConnectOpen}
                onClose={() => setIsConnectOpen(false)}
                onConnect={handleConnect}
                teams={connectableTeams}
            />

            <ConfigureRepositoryModal
                repository={configuring}
                teams={teams}
                onClose={() => setConfiguringId(undefined)}
                onSave={handleSave}
                onRetrySync={handleRetrySync}
                onDisconnect={handleDisconnect}
            />
        </>
    );
}
