import { requiredText } from "@/app/lib/validation";
import * as z from "zod";

/** Dados editáveis do time (limites iguais aos do backend: nome ≤ 100, descrição ≤ 500). */
export const manageTeamSchema = z.object({
    name: requiredText("Informe o nome do time.", 2).max(100, { error: "O nome deve ter no máximo 100 caracteres." }),
    description: z.string().trim().max(500, { error: "A descrição deve ter no máximo 500 caracteres." }),
});
