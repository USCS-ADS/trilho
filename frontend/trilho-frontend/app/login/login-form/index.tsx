"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import Link from "next/link";
import { useActionState } from "react";
import { login, type LoginFormState } from "../actions";

const INITIAL_STATE: LoginFormState = {};

interface LoginFormProps {
    /** Dica exibida só no modo demonstração (sem backend). */
    demoHint?: string;
}

export function LoginForm({ demoHint }: LoginFormProps) {
    const [state, formAction, isPending] = useActionState(login, INITIAL_STATE);

    return (
        <form action={formAction} noValidate>
            {state.message && (
                <p
                    role="alert"
                    className="mb-4 rounded-lg border border-trilho-danger/30 bg-trilho-danger/10 px-3 py-2 text-sm text-trilho-danger"
                >
                    {state.message}
                </p>
            )}

            <Input
                type="email"
                name="email"
                label="E-mail corporativo"
                placeholder="seu@email.com"
                autoComplete="email"
                defaultValue={state.email}
                error={state.errors?.email}
            />
            <Input
                type="password"
                name="password"
                label="Senha"
                autoComplete="current-password"
                error={state.errors?.password}
            />

            <div className="mb-6 flex justify-end">
                <Link
                    href="/reset-password"
                    className="text-sm text-trilho-accent hover:underline"
                >
                    Esqueci minha senha
                </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Entrando..." : "Entrar"}
            </Button>

            {demoHint && (
                <p className="mt-6 rounded-lg border border-trilho-border bg-trilho-surface px-3 py-2 text-xs text-trilho-dim">
                    {demoHint}
                </p>
            )}
        </form>
    );
}
