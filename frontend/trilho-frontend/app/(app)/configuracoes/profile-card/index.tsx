"use client";

import { Button } from "@/app/components/button";
import { Card, CardTitle } from "@/app/components/card";
import { Input } from "@/app/components/input";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, useState, useTransition } from "react";
import { updateOwnName } from "../actions";
import { profileSchema } from "../schema";

interface ProfileCardProps {
    name: string;
    email: string;
}

/** RF01: cada usuário edita apenas os próprios dados; o e-mail é o identificador e não muda. */
export function ProfileCard({ name, email }: ProfileCardProps) {
    const [draftName, setDraftName] = useState(name);
    const [status, setStatus] = useState<{ kind: "saved" | "error"; message: string }>();
    const [isPending, startTransition] = useTransition();
    const { errors, validateValues, clearError } = useFormValidation(profileSchema);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus(undefined);

        const data = validateValues({ name: draftName });
        if (!data) return;

        startTransition(async () => {
            const result = await updateOwnName(data.name);
            setStatus(
                result.ok
                    ? { kind: "saved", message: "Alterações salvas." }
                    : { kind: "error", message: result.message },
            );
        });
    }

    return (
        <Card>
            <CardTitle>Meu perfil</CardTitle>

            <form onSubmit={handleSubmit} noValidate>
                <Input
                    name="name"
                    label="Nome completo"
                    value={draftName}
                    onChange={(event) => {
                        setDraftName(event.target.value);
                        clearError("name");
                        setStatus(undefined);
                    }}
                    error={errors.name}
                    autoComplete="name"
                    required
                />
                <Input name="profileEmail" label="E-mail" value={email} disabled readOnly />

                <Button type="submit" className="w-full text-sm" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar alterações"}
                </Button>

                {status && (
                    <p
                        role={status.kind === "error" ? "alert" : "status"}
                        className={`mt-3 text-center text-xs ${
                            status.kind === "error" ? "text-trilho-danger" : "text-trilho-success"
                        }`}
                    >
                        {status.message}
                    </p>
                )}
            </form>
        </Card>
    );
}
