"use client";

import { Button } from "@/app/components/button";
import { FormEvent, KeyboardEvent, useRef } from "react";

const CODE_LENGTH = 6;

export function VerifyCodeForm() {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    function focusInput(index: number) {
        inputsRef.current[index]?.focus();
    }

    function handleChange(index: number, value: string) {
        const digit = value.replace(/\D/g, "").slice(-1);
        const input = inputsRef.current[index];
        if (input) input.value = digit;

        if (digit && index < CODE_LENGTH - 1) {
            focusInput(index + 1);
        }
    }

    function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Backspace" && !event.currentTarget.value && index > 0) {
            focusInput(index - 1);
        }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // TODO: validar com zod e chamar a API de confirmação do código
    }

    function handleResendCode() {
        // TODO: chamar a API para reenviar o código de verificação
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-6 flex gap-2">
                {Array.from({ length: CODE_LENGTH }, (_, index) => index).map((index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            inputsRef.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        aria-label={`Dígito ${index + 1} do código`}
                        className="h-12 w-12 rounded-lg border border-trilho-border bg-trilho-surface-2 text-center text-lg text-trilho-text focus:border-trilho-accent focus:outline-none"
                        onChange={(event) => handleChange(index, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                    />
                ))}
            </div>

            <p className="mb-6 text-sm text-trilho-dim">
                Não recebeu?{" "}
                <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-trilho-accent hover:underline"
                >
                    Reenviar código
                </button>
            </p>

            <Button type="submit" className="w-full">
                Confirmar Código
            </Button>
        </form>
    );
}
