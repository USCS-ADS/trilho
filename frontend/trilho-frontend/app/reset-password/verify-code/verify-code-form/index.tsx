"use client";

import { Button } from "@/app/components/button";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { resendCodeAction, verifyCodeAction } from "../../actions";
import { verifyCodeSchema } from "../../schema";

const CODE_LENGTH = 6;

export function VerifyCodeForm() {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const [submitError, setSubmitError] = useState<string>();
    const [notice, setNotice] = useState<string>();
    const [isPending, setIsPending] = useState(false);
    const { errors, validateValues, clearError } = useFormValidation(verifyCodeSchema);

    function focusInput(index: number) {
        inputsRef.current[index]?.focus();
    }

    function handleChange(index: number, value: string) {
        const digit = value.replace(/\D/g, "").slice(-1);
        const input = inputsRef.current[index];
        if (input) input.value = digit;
        clearError("code");

        if (digit && index < CODE_LENGTH - 1) {
            focusInput(index + 1);
        }
    }

    function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Backspace" && !event.currentTarget.value && index > 0) {
            focusInput(index - 1);
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const code = inputsRef.current.map((input) => input?.value ?? "").join("");
        const data = validateValues({ code });
        if (!data) return;

        setSubmitError(undefined);
        setNotice(undefined);
        setIsPending(true);

        // Sucesso redireciona ao passo 3 (dentro da action); só volta aqui quando há erro.
        const result = await verifyCodeAction(data.code);

        setIsPending(false);
        if (result && !result.ok) setSubmitError(result.message);
    }

    async function handleResendCode() {
        setSubmitError(undefined);
        setNotice(undefined);

        const result = await resendCodeAction();

        if (result.ok) {
            setNotice("Enviamos um novo código. O anterior deixou de valer.");
        } else {
            setSubmitError(result.message);
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div
                role="group"
                aria-label="Código de verificação"
                aria-describedby={errors.code ? "code-error" : undefined}
                className="mb-2 flex gap-2"
            >
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
                        aria-invalid={errors.code ? true : undefined}
                        className={`h-12 w-12 rounded-lg border bg-trilho-surface-2 text-center text-lg text-trilho-text focus:outline-none ${
                            errors.code
                                ? "border-trilho-danger focus:border-trilho-danger"
                                : "border-trilho-border focus:border-trilho-accent"
                        }`}
                        onChange={(event) => handleChange(index, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                    />
                ))}
            </div>

            {errors.code && (
                <p id="code-error" role="alert" className="mb-2 text-xs text-trilho-danger">
                    {errors.code}
                </p>
            )}

            <p className="mb-6 mt-4 text-sm text-trilho-dim">
                Não recebeu?{" "}
                <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-trilho-accent hover:underline"
                >
                    Reenviar código
                </button>
            </p>

            {submitError && (
                <p role="alert" className="mb-4 text-sm text-trilho-danger">
                    {submitError}
                </p>
            )}
            {notice && (
                <p role="status" className="mb-4 text-sm text-trilho-success">
                    {notice}
                </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Confirmando..." : "Confirmar Código"}
            </Button>
        </form>
    );
}
