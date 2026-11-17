"use client";

import { Button } from "@/app/components/button";
import { Card, CardTitle } from "@/app/components/card";
import { Input } from "@/app/components/input";
import { PasswordRules } from "@/app/components/password-rules";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, useState, useTransition } from "react";
import { changeOwnPasswordAction } from "../actions";
import { changePasswordSchema } from "../schema";

/** Troca da própria senha: pede a atual (protege uma sessão deixada aberta) e confirma a nova. */
export function PasswordCard() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [status, setStatus] = useState<{ kind: "saved" | "error"; message: string }>();
    const [isPending, startTransition] = useTransition();
    const { errors, validateValues, clearError } = useFormValidation(changePasswordSchema);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus(undefined);

        const data = validateValues({ currentPassword, newPassword, confirmation });
        if (!data) return;

        startTransition(async () => {
            const result = await changeOwnPasswordAction(data);

            if (result.ok) {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmation("");
                setStatus({ kind: "saved", message: "Senha alterada." });
                return;
            }

            setStatus({ kind: "error", message: result.message });
        });
    }

    return (
        <Card>
            <CardTitle>Alterar senha</CardTitle>

            <form onSubmit={handleSubmit} noValidate>
                <Input
                    type="password"
                    name="currentPassword"
                    label="Senha atual"
                    value={currentPassword}
                    onChange={(event) => {
                        setCurrentPassword(event.target.value);
                        clearError("currentPassword");
                        setStatus(undefined);
                    }}
                    autoComplete="current-password"
                    error={errors.currentPassword}
                    required
                />
                <Input
                    type="password"
                    name="newPassword"
                    label="Nova senha"
                    value={newPassword}
                    onChange={(event) => {
                        setNewPassword(event.target.value);
                        clearError("newPassword");
                        setStatus(undefined);
                    }}
                    autoComplete="new-password"
                    error={errors.newPassword}
                    required
                />

                <PasswordRules value={newPassword} />

                <Input
                    type="password"
                    name="confirmation"
                    label="Confirmar nova senha"
                    value={confirmation}
                    onChange={(event) => {
                        setConfirmation(event.target.value);
                        clearError("confirmation");
                        setStatus(undefined);
                    }}
                    autoComplete="new-password"
                    error={errors.confirmation}
                    required
                />

                <Button type="submit" className="w-full text-sm" disabled={isPending}>
                    {isPending ? "Salvando..." : "Alterar senha"}
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
