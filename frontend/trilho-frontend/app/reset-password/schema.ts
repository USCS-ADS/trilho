import { emailField, passwordField } from "@/app/lib/validation";
import * as z from "zod";

export const requestResetSchema = z.object({
    email: emailField,
});

export const verifyCodeSchema = z.object({
    code: z.string().regex(/^\d{6}$/, { error: "Informe os 6 dígitos do código." }),
});

export const newPasswordSchema = z
    .object({
        password: passwordField,
        passwordConfirmation: z.string().min(1, { error: "Confirme a nova senha." }),
    })
    .refine((values) => values.password === values.passwordConfirmation, {
        path: ["passwordConfirmation"],
        error: "As senhas não coincidem.",
    });
