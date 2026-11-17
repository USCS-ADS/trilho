"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { requestResetAction } from "../actions";
import { requestResetSchema } from "../schema";

export function RequestResetForm() {
    const [email, setEmail] = useState("");
    const [submitError, setSubmitError] = useState<string>();
    const [isPending, setIsPending] = useState(false);
    const { errors, validateValues, clearError } = useFormValidation(requestResetSchema);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = validateValues({ email });
        if (!data) return;

        setSubmitError(undefined);
        setIsPending(true);

        // Sucesso redireciona ao passo 2 (dentro da action); só volta aqui quando há erro.
        const result = await requestResetAction(data.email);

        setIsPending(false);
        if (result && !result.ok) setSubmitError(result.message);
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <Input
                type="email"
                name="email"
                label="E-mail cadastrado"
                value={email}
                onChange={(event) => {
                    setEmail(event.target.value);
                    clearError("email");
                }}
                placeholder="seu@email.com"
                autoComplete="email"
                error={errors.email}
                required
            />

            {submitError && (
                <p role="alert" className="mb-4 text-sm text-trilho-danger">
                    {submitError}
                </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Enviando..." : "Enviar código"}
            </Button>

            <p className="mt-6 text-center text-sm text-trilho-dim">
                Lembrou a senha?{" "}
                <Link href="/login" className="text-trilho-accent hover:underline">
                    Voltar para o login
                </Link>
            </p>
        </form>
    );
}
