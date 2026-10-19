"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { PasswordRules } from "@/app/components/password-rules";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, useState } from "react";
import { activateAccountAction } from "../actions";
import { activateAccountSchema } from "../schema";

interface ActivateAccountFormProps {
    /** Token do convite (vem da URL de ativação). */
    inviteToken: string;
    /** Nome informado no convite; o convidado pode confirmar/editar. */
    defaultFullName?: string;
    /** Time ao qual o convite pertence — definido por quem convidou, somente leitura. */
    team?: string;
    /** E-mail para o qual o convite foi enviado — somente leitura. */
    email?: string;
}

export function ActivateAccountForm({
    inviteToken,
    defaultFullName = "",
    team = "",
    email = "",
}: ActivateAccountFormProps) {
    const [fullName, setFullName] = useState(defaultFullName);
    const [password, setPassword] = useState("");
    const [submitError, setSubmitError] = useState<string>();
    const [isPending, setIsPending] = useState(false);
    const { errors, validateValues, clearError } = useFormValidation(activateAccountSchema);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = validateValues({ fullName, password });
        if (!data) return;

        setSubmitError(undefined);
        setIsPending(true);

        // Sucesso redireciona ao login (dentro da action); só volta aqui quando há erro.
        const result = await activateAccountAction(inviteToken, data.fullName, data.password);

        setIsPending(false);
        if (result && !result.ok) setSubmitError(result.message);
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                    type="text"
                    name="fullName"
                    label="Nome completo"
                    value={fullName}
                    onChange={(event) => {
                        setFullName(event.target.value);
                        clearError("fullName");
                    }}
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    error={errors.fullName}
                    required
                />
                <Input type="text" name="team" label="Time" value={team} disabled readOnly />
            </div>

            <Input type="email" name="email" label="E-mail" value={email} disabled readOnly />

            <Input
                type="password"
                name="password"
                label="Nova senha"
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

            {submitError && (
                <p role="alert" className="mb-4 text-sm text-trilho-danger">
                    {submitError}
                </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Ativando..." : "Ativar Conta"}
            </Button>
        </form>
    );
}
