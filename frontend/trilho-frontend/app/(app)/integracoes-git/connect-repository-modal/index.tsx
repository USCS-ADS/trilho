"use client";

import { Modal } from "@/app/components/modal";
import type { ConnectRepositoryInput } from "@/app/lib/git-integrations/types";
import { ConnectRepositoryForm } from "./connect-repository-form";

interface ConnectRepositoryModalProps {
    open: boolean;
    onClose: () => void;
    onConnect: (input: ConnectRepositoryInput) => void;
    teams: { id: string; name: string }[];
}

export function ConnectRepositoryModal({
    open,
    onClose,
    onConnect,
    teams,
}: ConnectRepositoryModalProps) {
    return (
        <Modal open={open} onClose={onClose} title="Conectar Repositório">
            <ConnectRepositoryForm
                teams={teams}
                onSubmit={(input) => {
                    onConnect(input);
                    onClose();
                }}
                onCancel={onClose}
            />
        </Modal>
    );
}
