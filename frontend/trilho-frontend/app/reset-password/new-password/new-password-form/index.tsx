"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { PasswordRules } from "@/app/components/password-rules";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { newPasswordSchema } from "../../schema";

export function NewPasswordForm() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const { errors, validateValues, clearError } = useFormValidation(newPasswordSchema);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = validateValues({ password, passwordConfirmation: confirmation });
        if (!data) return;

        // TODO: chamar a API que redefine a senha — endpoint ainda não existe.
        router.push("/login");
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

            <Button type="submit" className="mt-2 w-full">
                Redefinir senha
            </Button>
        </form>
    );
}
