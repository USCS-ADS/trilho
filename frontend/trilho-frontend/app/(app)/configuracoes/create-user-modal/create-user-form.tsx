"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { ModalFooter } from "@/app/components/modal";
import { PasswordRules } from "@/app/components/password-rules";
import { Select } from "@/app/components/select";
import { ROLE_LABELS, type UserRole } from "@/app/lib/teams/roles";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, useState } from "react";
import { createUserSchema } from "../schema";

export interface NewUserInput {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

interface CreateUserFormProps {
    roles: UserRole[];
    /** E-mails já cadastrados ou convidados (o e-mail é único). */
    existingEmails: string[];
    onSubmit: (input: NewUserInput) => void;
    onCancel: () => void;
    isPending?: boolean;
    error?: string;
}

export function CreateUserForm({
    roles,
    existingEmails,
    onSubmit,
    onCancel,
    isPending = false,
    error: submitError,
}: CreateUserFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<UserRole>(
        roles.includes("member") ? "member" : (roles[0] ?? "member"),
    );

    const { errors, validateValues, clearError } = useFormValidation(createUserSchema(existingEmails));

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = validateValues({ name, email, password, role });
        if (!data) return;

        onSubmit({ ...data, email: data.email.toLowerCase() });
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <Input
                name="name"
                label="Nome completo"
                value={name}
                onChange={(event) => {
                    setName(event.target.value);
                    clearError("name");
                }}
                error={errors.name}
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

            <Input
                type="password"
                name="password"
                label="Senha inicial"
                value={password}
                onChange={(event) => {
                    setPassword(event.target.value);
                    clearError("password");
                }}
                autoComplete="new-password"
                error={errors.password}
                required
            />

            <PasswordRules value={password} />

            <Select
                name="role"
                label="Perfil de acesso"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                error={errors.role}
                options={roles.map((value) => ({ value, label: ROLE_LABELS[value] }))}
            />

            <p className="mb-2 text-xs text-trilho-dim">
                A conta nasce ativa, sem time. Combine a senha inicial com a pessoa; ela pode trocá-la depois em
                Configurações. Para fluxo por e-mail, use Convidar usuário.
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
                    {isPending ? "Criando..." : "Criar usuário"}
                </Button>
            </ModalFooter>
        </form>
    );
}
