"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { ModalFooter } from "@/app/components/modal";
import { Select } from "@/app/components/select";
import { Textarea } from "@/app/components/textarea";
import type { TaskPriority } from "@/app/lib/tasks/types";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, useState } from "react";
import { PriorityPicker } from "../../new-task-modal/priority-picker";
import { editTaskSchema } from "./schema";

export interface EditableTask {
    title: string;
    description: string;
    assigneeId?: string;
    dueDate?: string;
    priority: TaskPriority;
}

interface EditTaskFormProps {
    task: EditableTask;
    members: { id: string; name: string }[];
    isPending: boolean;
    error?: string;
    onSubmit: (input: EditableTask) => void;
    onCancel: () => void;
}

export function EditTaskForm({ task, members, isPending, error: submitError, onSubmit, onCancel }: EditTaskFormProps) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
    const [dueDate, setDueDate] = useState(task.dueDate ?? "");
    const [priority, setPriority] = useState<TaskPriority>(task.priority);

    const { errors, validateValues, clearError } = useFormValidation(editTaskSchema);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = validateValues({
            title,
            description,
            assigneeId: assigneeId || undefined,
            dueDate: dueDate || undefined,
            priority,
        });
        if (!data) return;

        onSubmit(data);
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <Input
                name="title"
                label="Título"
                value={title}
                onChange={(event) => {
                    setTitle(event.target.value);
                    clearError("title");
                }}
                error={errors.title}
                autoFocus
                required
            />

            <Textarea
                name="description"
                label="Descrição"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
            />

            <div className="grid gap-x-4 sm:grid-cols-2">
                <Select
                    name="assigneeId"
                    label="Responsável"
                    value={assigneeId}
                    onChange={(event) => setAssigneeId(event.target.value)}
                    options={[
                        { value: "", label: "Time inteiro" },
                        ...members.map((member) => ({ value: member.id, label: member.name })),
                    ]}
                />
                <Input
                    type="date"
                    name="dueDate"
                    label="Prazo"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    error={errors.dueDate}
                    className="[color-scheme:dark]"
                />
            </div>

            <PriorityPicker value={priority} onChange={setPriority} />

            {submitError && (
                <p role="alert" className="mb-4 text-sm text-trilho-danger">
                    {submitError}
                </p>
            )}

            <ModalFooter>
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar alterações"}
                </Button>
            </ModalFooter>
        </form>
    );
}
