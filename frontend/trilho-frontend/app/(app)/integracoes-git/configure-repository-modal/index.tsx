"use client";

import { Modal } from "@/app/components/modal";
import type { GitRepository } from "@/app/lib/git-integrations/types";
import { ConfigureRepositoryForm, type RepositorySettings } from "./configure-repository-form";

interface ConfigureRepositoryModalProps {
    /** Repositório em edição; ausente = modal fechado. */
    repository?: GitRepository;
    teams: { id: string; name: string }[];
    onClose: () => void;
    onSave: (repositoryId: string, settings: RepositorySettings) => void;
    onRetrySync: (repositoryId: string) => void;
    onDisconnect: (repositoryId: string) => void;
}

export function ConfigureRepositoryModal({
    repository,
    teams,
    onClose,
    onSave,
    onRetrySync,
    onDisconnect,
}: ConfigureRepositoryModalProps) {
    return (
        <Modal open={Boolean(repository)} onClose={onClose} title="Configurar repositório">
            {repository && (
                <ConfigureRepositoryForm
                    key={repository.id}
                    repository={repository}
                    teams={teams}
                    onSave={(settings) => {
                        onSave(repository.id, settings);
                        onClose();
                    }}
                    onRetrySync={() => onRetrySync(repository.id)}
                    onDisconnect={() => {
                        onDisconnect(repository.id);
                        onClose();
                    }}
                    onCancel={onClose}
                />
            )}
        </Modal>
    );
}
