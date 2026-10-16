import { requiredText } from "@/app/lib/validation";
import * as z from "zod";

/** RF02: todo time tem nome e um líder responsável, designado na criação. */
export const newTeamSchema = z.object({
    name: requiredText("Informe o nome do time.", 2),
    leaderId: z.string().min(1, { error: "Selecione o líder responsável." }),
    description: z.string().trim(),
    memberIds: z.array(z.string()).min(1),
});
