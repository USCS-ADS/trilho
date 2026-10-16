"use client";

import { Button } from "@/app/components/button";
import { PlusIcon } from "@/app/components/icons";
import { PageHeader } from "@/app/components/page-header";
import type { NewTeamInput, TeamWithMembers, User } from "@/app/lib/teams/types";
import { useState } from "react";
import { createTeamAction } from "../actions";
import { NewTeamModal } from "../new-team-modal";
import { TeamCard } from "../team-card";

interface TeamsWorkspaceProps {
    initialTeams: TeamWithMembers[];
    users: User[];
    /** RF02: só administradores criam times. */
    canCreateTeam: boolean;
    loadError?: string;
}

/** Estado compartilhado entre o botão do cabeçalho, o modal de novo time e a lista. */
export function TeamsWorkspace({ initialTeams, users, canCreateTeam, loadError }: TeamsWorkspaceProps) {
    const [teams, setTeams] = useState(initialTeams);
    const [isNewTeamOpen, setIsNewTeamOpen] = useState(false);

    // RF02: só quem tem perfil de líder/administrador e ainda não lidera um time pode liderar outro.
    const leaderCandidates = users.filter(
        (user) =>
            (user.role === "leader" || user.role === "admin") &&
            !teams.some((team) => team.leaderId === user.id),
    );

    /** Devolve a mensagem de erro (ou `undefined` se criou) para o modal exibir. */
    async function handleCreateTeam(input: NewTeamInput): Promise<string | undefined> {
        const result = await createTeamAction(input);
        if (!result.ok) return result.message;

        setTeams((previous) => [...previous, result.team]);
        return undefined;
    }

    return (
        <>
            <PageHeader
                title="Times"
                description={`${teams.length} ${teams.length === 1 ? "time ativo" : "times ativos"}`}
                actions={
                    canCreateTeam ? (
                        <Button
                            type="button"
                            className="gap-1.5 text-sm"
                            onClick={() => setIsNewTeamOpen(true)}
                        >
                            <PlusIcon className="h-4 w-4" />
                            Novo time
                        </Button>
                    ) : undefined
                }
            />

            {loadError && (
                <p
                    role="alert"
                    className="mx-8 mt-6 rounded-lg border border-trilho-danger/20 bg-trilho-danger/10 px-3 py-2 text-sm text-trilho-danger"
                >
                    {loadError}
                </p>
            )}

            {!loadError && teams.length === 0 && (
                <p className="mx-8 mt-6 text-sm text-trilho-dim">
                    Você ainda não participa de nenhum time.
                </p>
            )}

            <div className="grid gap-6 p-8 sm:grid-cols-2 xl:grid-cols-3">
                {teams.map((team) => (
                    <TeamCard
                        key={team.id}
                        team={team}
                        leaderName={users.find((user) => user.id === team.leaderId)?.name ?? "—"}
                    />
                ))}
            </div>

            <NewTeamModal
                open={isNewTeamOpen}
                onClose={() => setIsNewTeamOpen(false)}
                onCreate={handleCreateTeam}
                leaderCandidates={leaderCandidates}
                users={users}
            />
        </>
    );
}
