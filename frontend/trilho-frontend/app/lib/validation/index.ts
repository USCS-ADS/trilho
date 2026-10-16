import * as z from "zod";
import { isPasswordValid } from "../password-rules";

/** Primitivos de schema reutilizados pelos formulários (mensagens em pt-BR). */

export const emailField = z
    .string()
    .trim()
    .min(1, { error: "Informe o e-mail." })
    .pipe(z.email({ error: "Informe um e-mail válido." }));

export const passwordField = z
    .string()
    .min(1, { error: "Informe a senha." })
    .refine(isPasswordValid, { error: "A senha não atende a todos os requisitos." });

export const requiredText = (message: string, minLength = 1) =>
    z.string().trim().min(minLength, { error: message });

/** Mapa campo → primeira mensagem de erro. Erros sem campo ficam na chave `_form`. */
export type FieldErrors = Record<string, string>;

export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; errors: FieldErrors };

export function validate<S extends z.ZodType>(
    schema: S,
    data: unknown,
): ValidationResult<z.output<S>> {
    const result = schema.safeParse(data);
    if (result.success) return { success: true, data: result.data };

    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? "_form");
        if (!(field in errors)) errors[field] = issue.message;
    }

    return { success: false, errors };
}
