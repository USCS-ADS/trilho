"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { requestResetSchema } from "../schema";

export function RequestResetForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const { errors, validateValues, clearError } = useFormValidation(requestResetSchema);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = validateValues({ email });
        if (!data) return;

        // TODO: chamar a API que envia o código de redefinição — endpoint ainda não existe.
        router.push("/reset-password/verify-code");
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

            <Button type="submit" className="w-full">
                Enviar código
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
