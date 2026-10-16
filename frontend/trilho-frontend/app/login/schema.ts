import { emailField } from "@/app/lib/validation";
import * as z from "zod";

export const loginSchema = z.object({
    email: emailField,
    // Sem as regras de complexidade: contas existentes podem ter senhas antigas.
    password: z.string().min(1, { error: "Informe a senha." }),
});

export type LoginInput = z.output<typeof loginSchema>;
