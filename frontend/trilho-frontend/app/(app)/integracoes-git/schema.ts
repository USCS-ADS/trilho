import { PROVIDERS, WEBHOOK_EVENTS } from "@/app/lib/git-integrations/meta";
import * as z from "zod";

export const connectRepositorySchema = z.object({
    provider: z.enum(PROVIDERS, { error: "Selecione o provedor." }),
    fullName: z
        .string()
        .trim()
        .regex(/^[\w.-]+\/[\w.-]+$/, { error: "Use o formato dono/repositório." }),
    teamId: z.string().min(1, { error: "Selecione o time responsável." }),
});

export const configureRepositorySchema = z.object({
    teamId: z.string().min(1, { error: "Selecione o time responsável." }),
    events: z
        .array(z.enum(WEBHOOK_EVENTS))
        .min(1, { error: "Selecione ao menos um evento do webhook." }),
});
