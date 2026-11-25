import { emailField, passwordField, requiredText } from "@/app/lib/validation";
import { USER_ROLES } from "@/app/lib/teams/roles";
import * as z from "zod";

export const profileSchema = z.object({
    name: requiredText("Informe seu nome completo.", 2),
});

export const changeRoleSchema = z.object({
    userId: z.string().min(1),
    role: z.enum(USER_ROLES, { error: "Perfil de acesso inválido." }),
});

/** Cria o schema do convite sabendo quais e-mails já existem (RF01: e-mail único). */
export function createInviteSchema(existingEmails: string[]) {
    return z.object({
        fullName: requiredText("Informe o nome completo.", 2),
        email: emailField.refine((email) => !existingEmails.includes(email.toLowerCase()), {
            error: "Este e-mail já está cadastrado ou foi convidado.",
        }),
        teamId: z.string().min(1, { error: "Selecione o time de destino." }),
        role: z.enum(USER_ROLES, { error: "Selecione o perfil de acesso." }),
    });
}

/** Admin cria o usuário direto (sem convite): a senha inicial já vem definida. */
export function createUserSchema(existingEmails: string[]) {
    return z.object({
        name: requiredText("Informe o nome completo.", 2),
        email: emailField.refine((email) => !existingEmails.includes(email.toLowerCase()), {
            error: "Este e-mail já está cadastrado ou foi convidado.",
        }),
        password: passwordField,
        role: z.enum(USER_ROLES, { error: "Selecione o perfil de acesso." }),
    });
}

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, { error: "Informe a senha atual." }),
        newPassword: passwordField,
        confirmation: z.string().min(1, { error: "Confirme a nova senha." }),
    })
    .refine((values) => values.newPassword === values.confirmation, {
        path: ["confirmation"],
        error: "As senhas não coincidem.",
    })
    .refine((values) => values.newPassword !== values.currentPassword, {
        path: ["newPassword"],
        error: "A nova senha deve ser diferente da atual.",
    });
