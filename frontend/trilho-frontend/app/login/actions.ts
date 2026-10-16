"use server";

import { login as loginRequest } from "@/app/lib/api/auth";
import { toUserMessage } from "@/app/lib/api/errors";
import { createSession } from "@/app/lib/session";
import { validate, type FieldErrors } from "@/app/lib/validation";
import { redirect } from "next/navigation";
import { loginSchema } from "./schema";

export interface LoginFormState {
    errors?: FieldErrors;
    /** Erro geral (credenciais inválidas, API fora do ar). */
    message?: string;
    /** Devolvido para repovoar o campo após o reset do formulário. */
    email?: string;
}

export async function login(
    _previousState: LoginFormState,
    formData: FormData,
): Promise<LoginFormState> {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = validate(loginSchema, { email, password });
    if (!result.success) return { errors: result.errors, email };

    try {
        const { token } = await loginRequest(result.data);
        await createSession(token);
    } catch (error) {
        return { message: toUserMessage(error), email };
    }

    // `redirect` lança internamente; por isso fica fora do try/catch.
    redirect("/dashboard");
}
