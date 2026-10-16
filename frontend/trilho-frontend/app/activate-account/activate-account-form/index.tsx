"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { PasswordRules } from "@/app/components/password-rules";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { activateAccountSchema } from "../schema";

interface ActivateAccountFormProps {
    /** Nome informado no convite; o convidado pode confirmar/editar. */
    defaultFullName?: string;
    /** Time ao qual o convite pertence — definido por quem convidou, somente leitura. */
    team?: string;
    /** E-mail para o qual o convite foi enviado — somente leitura. */
    email?: string;
}

export function ActivateAccountForm({
    defaultFullName = "",
    team = "",
    email = "",
}: ActivateAccountFormProps) {
    const router = useRouter();
    const [fullName, setFullName] = useState(defaultFullName);
    const [password, setPassword] = useState("");
    const { errors, validateValues, clearError } = useFormValidation(activateAccountSchema);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = validateValues({ fullName, password });
        if (!data) return;

        // TODO: chamar a API de ativação — o backend ainda não tem fluxo de convite/ativação.
        router.push("/login");
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

            <Button type="submit" className="w-full">
                Ativar Conta
            </Button>
        </form>
    );
}
