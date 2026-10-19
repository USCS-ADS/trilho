"use client";

import { Modal } from "@/app/components/modal";
import type { UserRole } from "@/app/lib/teams/roles";
import type { NewInviteInput } from "@/app/lib/teams/types";
import { useState } from "react";
import { InviteUserForm } from "./invite-user-form";

interface InviteUserModalProps {
    open: boolean;
    onClose: () => void;
    /** Devolve a mensagem de erro, ou `undefined` quando o convite foi enviado. */
    onInvite: (input: NewInviteInput) => Promise<string | undefined>;
    teams: { id: string; name: string }[];
    roles: UserRole[];
    existingEmails: string[];
}

export function InviteUserModal({ open, onClose, onInvite, ...formProps }: InviteUserModalProps) {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string>();

    function handleClose() {
        setError(undefined);
        onClose();
    }

    async function handleSubmit(input: NewInviteInput) {
        setIsPending(true);
        setError(undefined);

        const message = await onInvite(input);

        setIsPending(false);
        if (message) {
            setError(message);
            return;
        }

        handleClose();
    }

    return (
        <Modal open={open} onClose={handleClose} title="Convidar usuário">
            <InviteUserForm
                {...formProps}
                onSubmit={handleSubmit}
                onCancel={handleClose}
                isPending={isPending}
                error={error}
            />
        </Modal>
    );
}
