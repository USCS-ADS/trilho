"use server";

import { createTeam } from "@/app/lib/api/teams";
import { fetchCurrentUser } from "@/app/lib/api/users";
import { toUserMessage } from "@/app/lib/api/errors";
import { verifySession } from "@/app/lib/session/dal";
import type { NewTeamInput, TeamWithMembers } from "@/app/lib/teams/types";
import { validate } from "@/app/lib/validation";
import { revalidatePath } from "next/cache";
import { newTeamSchema } from "./new-team-modal/schema";

export type CreateTeamResult =
    | { ok: true; team: TeamWithMembers }
    | { ok: false; message: string };

/**
 * RF02: só administradores criam times. A checagem é no servidor (esconder o
 * botão não protege nada) e o backend repete a regra com 403.
 */
export async function createTeamAction(input: NewTeamInput): Promise<CreateTeamResult> {
    const session = await verifySession();

    const result = validate(newTeamSchema, input);
    if (!result.success) return { ok: false, message: Object.values(result.errors)[0] };

    try {
        const currentUser = await fetchCurrentUser(session.token, session.userId);

        if (currentUser.role !== "admin") {
            return { ok: false, message: "Apenas administradores podem criar times." };
        }

        const team = await createTeam(result.data, session.token);

        revalidatePath("/times");
        return { ok: true, team };
    } catch (error) {
        return { ok: false, message: toUserMessage(error) };
    }
}
