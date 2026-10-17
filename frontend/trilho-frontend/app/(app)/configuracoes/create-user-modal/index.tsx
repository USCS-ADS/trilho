"use client";

import { Modal } from "@/app/components/modal";
import type { UserRole } from "@/app/lib/teams/roles";
import { useState } from "react";
import { CreateUserForm, type NewUserInput } from "./create-user-form";

interface CreateUserModalProps {
    open: boolean;
    onClose: () => void;
    /** Devolve a mensagem de erro, ou `undefined` quando o usuário foi criado. */
    onCreate: (input: NewUserInput) => Promise<string | undefined>;
    roles: UserRole[];
    existingEmails: string[];
}

export function CreateUserModal({ open, onClose, onCreate, ...formProps }: CreateUserModalProps) {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string>();

    function handleClose() {
        setError(undefined);
        onClose();
    }

    async function handleSubmit(input: NewUserInput) {
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
        <Modal open={open} onClose={handleClose} title="Criar usuário">
            <CreateUserForm
                {...formProps}
                onSubmit={handleSubmit}
                onCancel={handleClose}
                isPending={isPending}
                error={error}
            />
        </Modal>
    );
}
