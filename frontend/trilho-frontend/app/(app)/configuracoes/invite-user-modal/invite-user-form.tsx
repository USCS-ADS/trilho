"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { ModalFooter } from "@/app/components/modal";
import { Select } from "@/app/components/select";
import { ROLE_LABELS, type UserRole } from "@/app/lib/teams/roles";
import type { NewInviteInput } from "@/app/lib/teams/types";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, useState } from "react";
import { createInviteSchema } from "../schema";

interface InviteUserFormProps {
    teams: { id: string; name: string }[];
    roles: UserRole[];
    /** E-mails já cadastrados ou convidados (RF01: o e-mail é único). */
    existingEmails: string[];
    onSubmit: (input: NewInviteInput) => void;
    onCancel: () => void;
}

export function InviteUserForm({
    teams,
    roles,
    existingEmails,
    onSubmit,
    onCancel,
}: InviteUserFormProps) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
    const [role, setRole] = useState<UserRole>(
        roles.includes("member") ? "member" : (roles[0] ?? "member"),
    );

    const { errors, validateValues, clearError } = useFormValidation(
        createInviteSchema(existingEmails),
    );

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = validateValues({ fullName, email, teamId, role });
        if (!data) return;

        // TODO: chamar a API de convite (envio do e-mail com link de ativação) — endpoint ainda não existe.
        onSubmit({ ...data, email: data.email.toLowerCase() });
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <Input
                name="fullName"
                label="Nome completo"
                value={fullName}
                onChange={(event) => {
                    setFullName(event.target.value);
                    clearError("fullName");
                }}
                placeholder="Nome de quem será convidado"
                error={errors.fullName}
                autoFocus
                required
            />

            <Input
                type="email"
                name="email"
                label="E-mail"
                value={email}
                onChange={(event) => {
                    setEmail(event.target.value);
                    clearError("email");
                }}
                placeholder="pessoa@empresa.com"
                error={errors.email}
                required
            />

            <div className="grid gap-x-4 sm:grid-cols-2">
                <Select
                    name="teamId"
                    label="Time de destino"
                    value={teamId}
                    onChange={(event) => setTeamId(event.target.value)}
                    error={errors.teamId}
                    options={teams.map((team) => ({ value: team.id, label: team.name }))}
                />
                <Select
                    name="role"
                    label="Perfil de acesso"
                    value={role}
                    onChange={(event) => setRole(event.target.value as UserRole)}
                    error={errors.role}
                    options={roles.map((value) => ({ value, label: ROLE_LABELS[value] }))}
                />
            </div>

            <p className="mb-2 text-xs text-trilho-dim">
                A pessoa receberá um e-mail com o link para ativar a conta e definir a senha.
            </p>

            <ModalFooter>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit">Enviar convite</Button>
            </ModalFooter>
        </form>
    );
}
