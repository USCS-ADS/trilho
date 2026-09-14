"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { FormEvent } from "react";

export function LoginForm() {
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // TODO: validar com zod e chamar a API de login (POST /api/Auth)
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input
                type="email"
                name="email"
                label="E-mail corporativo"
                placeholder="seu@email.com"
                autoComplete="email"
                required
            />
            <Input
                type="password"
                name="password"
                label="Senha"
                autoComplete="current-password"
                required
            />

            <div className="mb-6 flex justify-end">
                <a href="#" className="text-sm text-trilho-accent hover:underline">
                    Esqueci minha senha
                </a>
            </div>

            <Button type="submit">Entrar</Button>
        </form>
    );
}
