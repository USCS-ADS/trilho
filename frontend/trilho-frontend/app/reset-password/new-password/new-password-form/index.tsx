"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { PasswordRules } from "@/app/components/password-rules";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, useState } from "react";
import { confirmResetAction } from "../../actions";
import { newPasswordSchema } from "../../schema";

export function NewPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [submitError, setSubmitError] = useState<string>();
    const [isPending, setIsPending] = useState(false);
    const { errors, validateValues, clearError } = useFormValidation(newPasswordSchema);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = validateValues({ password, passwordConfirmation: confirmation });
        if (!data) return;

        setSubmitError(undefined);
        setIsPending(true);

        // Sucesso redireciona ao login (dentro da action); só volta aqui quando há erro.
        const result = await confirmResetAction(data.password, data.passwordConfirmation);

        setIsPending(false);
        if (result && !result.ok) setSubmitError(result.message);
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
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

            <Input
                type="password"
                name="passwordConfirmation"
                label="Confirmar nova senha"
                value={confirmation}
                onChange={(event) => {
                    setConfirmation(event.target.value);
                    clearError("passwordConfirmation");
                }}
                autoComplete="new-password"
                error={errors.passwordConfirmation}
                required
            />

            {submitError && (
                <p role="alert" className="mb-2 text-sm text-trilho-danger">
                    {submitError}
                </p>
            )}

            <Button type="submit" className="mt-2 w-full" disabled={isPending}>
                {isPending ? "Salvando..." : "Redefinir senha"}
            </Button>
        </form>
    );
}
