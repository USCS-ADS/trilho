"use client";

import { Button } from "@/app/components/button";
import { Modal } from "@/app/components/modal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteTaskAction, updateTaskAction } from "../actions";
import { EditTaskForm, type EditableTask } from "../edit-task-modal/edit-task-form";

interface TaskActionsProps {
    taskId: string;
    teamId: string;
    task: EditableTask;
    members: { id: string; name: string }[];
    /** Excluir é do administrador e do líder do time (a API também exige). */
    canDelete: boolean;
}

/** Botões do cabeçalho do detalhe: editar (membros do time) e excluir (líder/admin, com confirmação). */
export function TaskActions({ taskId, teamId, task, members, canDelete }: TaskActionsProps) {
    const router = useRouter();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [editError, setEditError] = useState<string>();
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleteError, setDeleteError] = useState<string>();

    function closeEdit() {
        setEditError(undefined);
        setIsEditOpen(false);
    }

    async function handleSave(input: EditableTask) {
        setIsPending(true);
        setEditError(undefined);

        const result = await updateTaskAction(taskId, input);

        setIsPending(false);
        if (!result.ok) {
            setEditError(result.message);
            return;
        }

        closeEdit();
        // A página do detalhe é renderizada no servidor: recarrega os dados já salvos.
        router.refresh();
    }

    async function handleDelete() {
        setIsPending(true);
        setDeleteError(undefined);

        // Sucesso redireciona ao quadro (dentro da action); só volta aqui quando há erro.
        const result = await deleteTaskAction(taskId, teamId);

        setIsPending(false);
        if (result && !result.ok) {
            setDeleteError(result.message);
            setConfirmingDelete(false);
        }
    }

    return (
        <>
            <div className="flex flex-wrap items-center justify-end gap-2">
                <Button type="button" variant="secondary" className="text-sm" onClick={() => setIsEditOpen(true)}>
                    Editar
                </Button>

                {canDelete &&
                    (confirmingDelete ? (
                        <>
                            <Button type="button" variant="danger" className="text-sm" disabled={isPending} onClick={handleDelete}>
                                {isPending ? "Excluindo..." : "Confirmar exclusão"}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                className="text-sm"
                                disabled={isPending}
                                onClick={() => setConfirmingDelete(false)}
                            >
                                Cancelar
                            </Button>
                        </>
                    ) : (
                        <Button type="button" variant="danger" className="text-sm" onClick={() => setConfirmingDelete(true)}>
                            Excluir
                        </Button>
                    ))}

                {deleteError && (
                    <p role="alert" className="basis-full text-right text-sm text-trilho-danger">
                        {deleteError}
                    </p>
                )}
            </div>

            <Modal open={isEditOpen} onClose={closeEdit} title="Editar tarefa">
                <EditTaskForm
                    task={task}
                    members={members}
                    isPending={isPending}
                    error={editError}
                    onSubmit={handleSave}
                    onCancel={closeEdit}
                />
            </Modal>
        </>
    );
}
