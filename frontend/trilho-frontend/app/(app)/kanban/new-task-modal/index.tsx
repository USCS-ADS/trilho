"use client";

import { Modal } from "@/app/components/modal";
import type { AssigneeSuggestion } from "@/app/lib/ai-suggestions/assignee";
import type { NewTaskInput } from "@/app/lib/tasks/types";
import type { TeamWithMembers } from "@/app/lib/teams/types";
import { useState } from "react";
import { NewTaskForm } from "./new-task-form";

interface NewTaskModalProps {
    open: boolean;
    onClose: () => void;
    /** Devolve a mensagem de erro, ou `undefined` quando a tarefa foi criada. */
    onCreate: (input: NewTaskInput) => Promise<string | undefined>;
    teams: TeamWithMembers[];
    defaultTeamId: string;
    assigneeSuggestions: Record<string, AssigneeSuggestion | undefined>;
    today: string;
}

export function NewTaskModal({ open, onClose, onCreate, ...formProps }: NewTaskModalProps) {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string>();

    function handleClose() {
        setError(undefined);
        onClose();
    }

    async function handleSubmit(input: NewTaskInput) {
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
        <Modal open={open} onClose={handleClose} title="Nova Tarefa">
            <NewTaskForm
                {...formProps}
                onSubmit={handleSubmit}
                onCancel={handleClose}
                isPending={isPending}
                error={error}
            />
        </Modal>
    );
}
