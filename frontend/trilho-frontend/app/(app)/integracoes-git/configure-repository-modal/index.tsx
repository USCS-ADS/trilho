"use client";

import { Modal } from "@/app/components/modal";
import type { GitRepository, GitWebhookEvent } from "@/app/lib/git-integrations/types";
import { useState } from "react";
import { ConfigureRepositoryForm } from "./configure-repository-form";

interface ConfigureRepositoryModalProps {
    /** Repositório em edição; ausente = modal fechado. */
    repository?: GitRepository;
    teams: { id: string; name: string }[];
    onClose: () => void;
    /** As ações devolvem a mensagem de erro, ou `undefined` em caso de sucesso. */
    onSave: (repositoryId: string, events: GitWebhookEvent[]) => Promise<string | undefined>;
    onRetrySync: (repositoryId: string) => Promise<string | undefined>;
    onDisconnect: (repositoryId: string) => Promise<string | undefined>;
}

export function ConfigureRepositoryModal({
    repository,
    teams,
    onClose,
    onSave,
    onRetrySync,
    onDisconnect,
}: ConfigureRepositoryModalProps) {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string>();

    function handleClose() {
        setError(undefined);
        onClose();
    }

    /** Executa a ação; fecha o modal se `closeOnSuccess` e não houve erro. */
    async function run(action: () => Promise<string | undefined>, closeOnSuccess: boolean) {
        setIsPending(true);
        setError(undefined);

        const message = await action();

        setIsPending(false);
        if (message) {
            setError(message);
            return;
        }

        if (closeOnSuccess) handleClose();
    }

    return (
        <Modal open={Boolean(repository)} onClose={handleClose} title="Configurar repositório">
            {repository && (
                <ConfigureRepositoryForm
                    key={repository.id}
                    repository={repository}
                    teams={teams}
                    isPending={isPending}
                    error={error}
                    onSave={(settings) => run(() => onSave(repository.id, settings.events), true)}
                    onRetrySync={() => run(() => onRetrySync(repository.id), false)}
                    onDisconnect={() => run(() => onDisconnect(repository.id), true)}
                    onCancel={handleClose}
                />
            )}
        </Modal>
    );
}
