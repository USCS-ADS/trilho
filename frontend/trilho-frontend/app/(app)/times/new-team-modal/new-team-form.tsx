"use client";

import { Button } from "@/app/components/button";
import { controlClasses } from "@/app/components/form-field";
import { PlusIcon, XIcon } from "@/app/components/icons";
import { Input } from "@/app/components/input";
import { ModalFooter } from "@/app/components/modal";
import { Select } from "@/app/components/select";
import { Textarea } from "@/app/components/textarea";
import type { NewTeamInput, User } from "@/app/lib/teams/types";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, useState } from "react";
import { newTeamSchema } from "./schema";

interface NewTeamFormProps {
    /** Quem ainda não lidera nenhum time (RF02: só se lidera um time por vez). */
    leaderCandidates: User[];
    /** Todos os usuários que podem ser adicionados como membros. */
    users: User[];
    onSubmit: (input: NewTeamInput) => void;
    onCancel: () => void;
    isPending?: boolean;
    /** Erro devolvido pelo servidor ao criar o time. */
    error?: string;
}

export function NewTeamForm({
    leaderCandidates,
    users,
    onSubmit,
    onCancel,
    isPending = false,
    error: submitError,
}: NewTeamFormProps) {
    const [name, setName] = useState("");
    const [leaderId, setLeaderId] = useState("");
    const [description, setDescription] = useState("");
    const [extraMemberIds, setExtraMemberIds] = useState<string[]>([]);
    const [isAddingMember, setIsAddingMember] = useState(false);

    const { errors, validateValues, clearError } = useFormValidation(newTeamSchema);

    const leader = users.find((user) => user.id === leaderId);
    const extraMembers = extraMemberIds
        .map((memberId) => users.find((user) => user.id === memberId))
        .filter((user): user is User => user !== undefined);
    const addableUsers = users.filter(
        (user) => user.id !== leaderId && !extraMemberIds.includes(user.id),
    );

    function handleLeaderChange(nextLeaderId: string) {
        setLeaderId(nextLeaderId);
        clearError("leaderId");
        // O líder já é membro; evita duplicata se ele havia sido adicionado antes.
        setExtraMemberIds((previous) => previous.filter((id) => id !== nextLeaderId));
    }

    function addMember(userId: string) {
        if (!userId) return;
        setExtraMemberIds((previous) => [...previous, userId]);
        setIsAddingMember(false);
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = validateValues({
            name,
            leaderId,
            description,
            // O líder é sempre o primeiro membro.
            memberIds: leaderId ? [leaderId, ...extraMemberIds] : [],
        });
        if (!data) return;

        onSubmit(data);
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="grid gap-x-4 sm:grid-cols-2">
                <Input
                    name="name"
                    label="Nome do time"
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        clearError("name");
                    }}
                    placeholder="Ex: Plataforma de Dados"
                    error={errors.name}
                    autoFocus
                    required
                />
                <Select
                    name="leaderId"
                    label="Líder responsável"
                    value={leaderId}
                    onChange={(event) => handleLeaderChange(event.target.value)}
                    placeholder="Selecione um líder"
                    error={errors.leaderId}
                    options={leaderCandidates.map((user) => ({ value: user.id, label: user.name }))}
                    required
                />
            </div>

            <Textarea
                name="description"
                label="Descrição"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="O que este time faz?"
            />

            <fieldset className="mb-4">
                <legend className="mb-2 block text-xs font-medium uppercase tracking-wide text-trilho-dim">
                    Membros iniciais
                </legend>

                <ul className="flex flex-wrap items-center gap-2">
                    {leader && (
                        <li className="rounded-full border border-trilho-accent bg-trilho-accent/10 px-3 py-1.5 text-xs font-medium text-trilho-accent">
                            {leader.name} <span className="text-trilho-dim">(líder)</span>
                        </li>
                    )}

                    {extraMembers.map((member) => (
                        <li
                            key={member.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-trilho-accent bg-trilho-accent/10 px-3 py-1.5 text-xs font-medium text-trilho-accent"
                        >
                            {member.name}
                            <button
                                type="button"
                                aria-label={`Remover ${member.name}`}
                                onClick={() =>
                                    setExtraMemberIds((previous) =>
                                        previous.filter((id) => id !== member.id),
                                    )
                                }
                                className="rounded-full hover:text-trilho-text"
                            >
                                <XIcon className="h-3 w-3" />
                            </button>
                        </li>
                    ))}

                    <li>
                        {isAddingMember ? (
                            <select
                                aria-label="Adicionar membro"
                                autoFocus
                                defaultValue=""
                                onChange={(event) => addMember(event.target.value)}
                                onBlur={() => setIsAddingMember(false)}
                                className={`${controlClasses(false)} w-auto py-1 text-xs`}
                            >
                                <option value="" disabled>
                                    Selecione uma pessoa
                                </option>
                                {addableUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsAddingMember(true)}
                                disabled={addableUsers.length === 0}
                                className="inline-flex items-center gap-1 rounded-full border border-trilho-border px-3 py-1.5 text-xs text-trilho-dim transition-colors hover:text-trilho-text disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <PlusIcon className="h-3 w-3" />
                                Adicionar membro
                            </button>
                        )}
                    </li>
                </ul>
            </fieldset>

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
                    {isPending ? "Criando..." : "Criar Time"}
                </Button>
            </ModalFooter>
        </form>
    );
}
