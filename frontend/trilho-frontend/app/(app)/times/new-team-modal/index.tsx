"use client";

import { Modal } from "@/app/components/modal";
import type { NewTeamInput, User } from "@/app/lib/teams/types";
import { useState } from "react";
import { NewTeamForm } from "./new-team-form";

interface NewTeamModalProps {
    open: boolean;
    onClose: () => void;
    /** Devolve a mensagem de erro, ou `undefined` quando o time foi criado. */
    onCreate: (input: NewTeamInput) => Promise<string | undefined>;
    leaderCandidates: User[];
    users: User[];
}

export function NewTeamModal({ open, onClose, onCreate, ...formProps }: NewTeamModalProps) {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string>();

    function handleClose() {
        setError(undefined);
        onClose();
    }

    async function handleSubmit(input: NewTeamInput) {
        setIsPending(true);
        setError(undefined);

        const message = await onCreate(input);

        setIsPending(false);
        if (message) {
            setError(message);
            return;
        }

        handleClose();
    }

    return (
        <Modal open={open} onClose={handleClose} title="Novo Time">
            <NewTeamForm
                {...formProps}
                onSubmit={handleSubmit}
                onCancel={handleClose}
                isPending={isPending}
                error={error}
            />
        </Modal>
    );
}
