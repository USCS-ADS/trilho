import { PRIORITIES } from "@/app/lib/tasks/meta";
import { requiredText } from "@/app/lib/validation";
import * as z from "zod";

/** RF03: toda tarefa tem título, time e prioridade; responsável e prazo são opcionais. */
export const newTaskSchema = z.object({
    title: requiredText("Informe um título com ao menos 3 caracteres.", 3),
    description: z.string().trim(),
    teamId: z.string().min(1, { error: "Selecione o time." }),
    assigneeId: z.string().optional(),
    dueDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Informe uma data válida." })
        .optional(),
    priority: z.enum(PRIORITIES, { error: "Selecione a prioridade." }),
});
