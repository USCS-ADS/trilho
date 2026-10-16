import { passwordField, requiredText } from "@/app/lib/validation";
import * as z from "zod";

export const activateAccountSchema = z.object({
    fullName: requiredText("Informe seu nome completo.", 2),
    password: passwordField,
});
