"use client";

import { FormEvent } from "react";
import { Button } from "../../components/button";
import { Input } from "../../components/input";

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
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // TODO: validar com zod e chamar a API de ativação de conta
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                    type="text"
                    name="fullName"
                    label="Nome completo"
                    defaultValue={defaultFullName}
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    required
                />
                <Input type="text" name="team" label="Time" value={team} disabled readOnly />
            </div>

            <Input type="email" name="email" label="E-mail" value={email} disabled readOnly />

            <Input
                type="password"
                name="password"
                label="Nova senha"
                autoComplete="new-password"
                required
            />

            <Button type="submit">Ativar Conta</Button>
        </form>
    );
}
