"use client";

import { Modal } from "@/app/components/modal";
import type { UserRole } from "@/app/lib/teams/roles";
import type { NewInviteInput } from "@/app/lib/teams/types";
import { InviteUserForm } from "./invite-user-form";

interface InviteUserModalProps {
    open: boolean;
    onClose: () => void;
    onInvite: (input: NewInviteInput) => void;
    teams: { id: string; name: string }[];
    roles: UserRole[];
    existingEmails: string[];
}

export function InviteUserModal({ open, onClose, onInvite, ...formProps }: InviteUserModalProps) {
    return (
        <Modal open={open} onClose={onClose} title="Convidar usuário">
            <InviteUserForm
                {...formProps}
                onSubmit={(input) => {
                    onInvite(input);
                    onClose();
                }}
                onCancel={onClose}
            />
        </Modal>
    );
}
