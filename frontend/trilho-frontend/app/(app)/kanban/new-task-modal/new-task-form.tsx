"use client";

import { Button } from "@/app/components/button";
import { BoltIcon } from "@/app/components/icons";
import { Input } from "@/app/components/input";
import { ModalFooter } from "@/app/components/modal";
import { Select } from "@/app/components/select";
import { Textarea } from "@/app/components/textarea";
import type { AssigneeSuggestion } from "@/app/lib/ai-suggestions/assignee";
import { suggestPriority } from "@/app/lib/ai-suggestions/priority";
import { PRIORITY_LABELS } from "@/app/lib/tasks/meta";
import type { NewTaskInput, TaskPriority } from "@/app/lib/tasks/types";
import type { TeamWithMembers } from "@/app/lib/teams/types";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, useState } from "react";
import { newTaskSchema } from "./schema";
import { PriorityPicker } from "./priority-picker";

interface NewTaskFormProps {
    teams: TeamWithMembers[];
    defaultTeamId: string;
    /** Sugestão de responsável por time (calculada no servidor). */
    assigneeSuggestions: Record<string, AssigneeSuggestion | undefined>;
    today: string;
    onSubmit: (input: NewTaskInput) => void;
    onCancel: () => void;
    isPending?: boolean;
    /** Erro devolvido pelo servidor ao criar a tarefa. */
    error?: string;
}

export function NewTaskForm({
    teams,
    defaultTeamId,
    assigneeSuggestions,
    today,
    onSubmit,
    onCancel,
    isPending = false,
    error: submitError,
}: NewTaskFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [teamId, setTeamId] = useState(defaultTeamId);
    const [assigneeId, setAssigneeId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");

    const { errors, validateValues, clearError } = useFormValidation(newTaskSchema);

    const team = teams.find((candidate) => candidate.id === teamId);
    const suggestedAssignee = assigneeSuggestions[teamId];
    const suggestedPriority = suggestPriority(today, dueDate || undefined);

    function handleTeamChange(nextTeamId: string) {
        setTeamId(nextTeamId);
        setAssigneeId(""); // o responsável anterior pode não pertencer ao novo time
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = validateValues({
            title,
            description,
            teamId,
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
                placeholder="Ex: Adicionar cache no endpoint de dashboard"
                error={errors.title}
                autoFocus
                required
            />

            <Textarea
                name="description"
                label="Descrição"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descreva o que precisa ser feito"
            />

            <div className="grid gap-x-4 sm:grid-cols-2">
                <Select
                    name="teamId"
                    label="Time"
                    value={teamId}
                    onChange={(event) => handleTeamChange(event.target.value)}
                    error={errors.teamId}
                    options={teams.map((option) => ({ value: option.id, label: option.name }))}
                />
                <Select
                    name="assigneeId"
                    label="Responsável (opcional)"
                    value={assigneeId}
                    onChange={(event) => setAssigneeId(event.target.value)}
                    options={[
                        { value: "", label: "Time inteiro" },
                        ...(team?.members ?? []).map((member) => ({
                            value: member.id,
                            label: member.name,
                        })),
                    ]}
                />
            </div>

            <div className="grid gap-x-4 sm:grid-cols-2">
                <Input
                    type="date"
                    name="dueDate"
                    label="Prazo"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    error={errors.dueDate}
                    className="[color-scheme:dark]"
                />
                <PriorityPicker value={priority} onChange={setPriority} />
            </div>

            <p className="flex items-start gap-2 rounded-lg border border-trilho-accent-2/40 bg-trilho-accent-2/10 px-3 py-2 text-sm text-trilho-text">
                <BoltIcon className="mt-0.5 h-4 w-4 shrink-0 text-trilho-accent-2" />
                <span>
                    <strong>Sugestão da IA:</strong> prioridade{" "}
                    {PRIORITY_LABELS[suggestedPriority]}
                    {suggestedAssignee && team && (
                        <>
                            {" "}
                            e responsável recomendado: {suggestedAssignee.name} (menor carga
                            atual no time {team.name}).
                        </>
                    )}
                </span>
            </p>

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
                    {isPending ? "Criando..." : "Criar Tarefa"}
                </Button>
            </ModalFooter>
        </form>
    );
}
