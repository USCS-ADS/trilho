"use server";

import { isMockMode } from "@/app/lib/api/config";
import { toUserMessage } from "@/app/lib/api/errors";
import {
    connectRepository,
    disconnectRepository,
    fetchRepositories,
    retryRepository,
    updateRepositoryEvents,
} from "@/app/lib/api/git";
import type {
    ConnectRepositoryInput,
    GitRepository,
    GitWebhookEvent,
    WebhookSetup,
} from "@/app/lib/git-integrations/types";
import { verifySession } from "@/app/lib/session/dal";
import { validate } from "@/app/lib/validation";
import { revalidatePath } from "next/cache";
import { configureRepositorySchema, connectRepositorySchema } from "./schema";

export type ConnectResult =
    | { ok: true; repository?: GitRepository; webhook?: WebhookSetup }
    | { ok: false; message: string };

export type SimpleResult = { ok: true } | { ok: false; message: string };

export type RetryResult =
    | { ok: true; repository?: GitRepository; processed: number; failed: number }
    | { ok: false; message: string };

/**
 * Conecta o repositório. A resposta traz a URL e o segredo do webhook (únicos momentos em que
 * o segredo é exibido). No modo demonstração devolve `ok` sem webhook.
 */
export async function connectRepositoryAction(input: ConnectRepositoryInput): Promise<ConnectResult> {
    const session = await verifySession();

    const result = validate(connectRepositorySchema, input);
    if (!result.success) return { ok: false, message: Object.values(result.errors)[0] };

    if (isMockMode) return { ok: true };

    try {
        const { repository, webhook } = await connectRepository(result.data, session.token);

        revalidatePath("/integracoes-git");
        return { ok: true, repository, webhook };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}

/** Altera os eventos escutados. O time do repositório não muda: para outro time, reconecte. */
export async function saveRepositoryAction(
    repositoryId: string,
    events: GitWebhookEvent[],
): Promise<SimpleResult> {
    const session = await verifySession();

    const result = validate(configureRepositorySchema.pick({ events: true }), { events });
    if (!result.success) return { ok: false, message: Object.values(result.errors)[0] };

    if (isMockMode || repositoryId.startsWith("local-")) return { ok: true };

    try {
        await updateRepositoryEvents(repositoryId, result.data.events, session.token);
        revalidatePath("/integracoes-git");
        return { ok: true };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}

export async function retryRepositoryAction(repositoryId: string): Promise<RetryResult> {
    const session = await verifySession();

    if (isMockMode || repositoryId.startsWith("local-")) {
        return { ok: true, processed: 0, failed: 0 };
    }

    try {
        const run = await retryRepository(repositoryId, session.token);
        const repository = (await fetchRepositories(session.token)).find((item) => item.id === repositoryId);

        revalidatePath("/integracoes-git");
        return { ok: true, repository, processed: run?.processed ?? 0, failed: run?.failed ?? 0 };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}

export async function disconnectRepositoryAction(repositoryId: string): Promise<SimpleResult> {
    const session = await verifySession();

    if (isMockMode || repositoryId.startsWith("local-")) return { ok: true };

    try {
        await disconnectRepository(repositoryId, session.token);
        revalidatePath("/integracoes-git");
        return { ok: true };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}
