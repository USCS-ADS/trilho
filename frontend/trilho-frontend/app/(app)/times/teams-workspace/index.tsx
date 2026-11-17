"use client";

import { Button } from "@/app/components/button";
import { PlusIcon } from "@/app/components/icons";
import { PageHeader } from "@/app/components/page-header";
import type { UserRole } from "@/app/lib/teams/roles";
import type { NewTeamInput, TeamWithMembers, User } from "@/app/lib/teams/types";
import { useState } from "react";
import { createTeamAction } from "../actions";
import { ManageTeamModal } from "../manage-team-modal";
import { NewTeamModal } from "../new-team-modal";
import { TeamCard } from "../team-card";

interface TeamsWorkspaceProps {
    initialTeams: TeamWithMembers[];
    users: User[];
    /** RF02: só administradores criam times. */
    canCreateTeam: boolean;
    /** Quem está logado: o administrador gerencia tudo; o líder, só os times que lidera. */
    currentUser: { id: string; role: UserRole };
    loadError?: string;
}

/** Estado compartilhado entre o botão do cabeçalho, o modal de novo time e a lista. */
export function TeamsWorkspace({
    initialTeams,
    users,
    canCreateTeam,
    currentUser,
    loadError,
}: TeamsWorkspaceProps) {
    const [teams, setTeams] = useState(initialTeams);
    const [isNewTeamOpen, setIsNewTeamOpen] = useState(false);
    const [managingId, setManagingId] = useState<string>();

    const isAdmin = currentUser.role === "admin";
    const activeTeams = teams.filter((team) => !team.isArchived);
    const managing = teams.find((team) => team.id === managingId);

    // RF02: só quem tem perfil de líder/administrador e ainda não lidera um time ativo pode liderar outro.
    const leaderCandidates = users.filter(
        (user) =>
            (user.role === "leader" || user.role === "admin") &&
            !activeTeams.some((team) => team.leaderId === user.id),
    );

    /** Para trocar o líder de um time: os mesmos critérios, mais o líder atual sai da lista. */
    const leaderCandidatesFor = (team: TeamWithMembers) =>
        leaderCandidates.filter((user) => user.id !== team.leaderId);

    const canManage = (team: TeamWithMembers) => isAdmin || team.leaderId === currentUser.id;

    /** Devolve a mensagem de erro (ou `undefined` se criou) para o modal exibir. */
    async function handleCreateTeam(input: NewTeamInput): Promise<string | undefined> {
        const result = await createTeamAction(input);
        if (!result.ok) return result.message;

        setTeams((previous) => [...previous, result.team]);
        return undefined;
    }

    function replaceTeam(updated: TeamWithMembers) {
        setTeams((previous) => previous.map((team) => (team.id === updated.id ? updated : team)));
    }

    return (
        <>
            <PageHeader
                title="Times"
                description={`${activeTeams.length} ${activeTeams.length === 1 ? "time ativo" : "times ativos"}`}
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
                        leaderName={
                            team.members.find((member) => member.id === team.leaderId)?.name ??
                            users.find((user) => user.id === team.leaderId)?.name ??
                            "—"
                        }
                        onManage={canManage(team) ? () => setManagingId(team.id) : undefined}
                    />
                ))}
            </div>

            <ManageTeamModal
                team={managing}
                users={users}
                leaderCandidates={managing ? leaderCandidatesFor(managing) : []}
                isAdmin={isAdmin}
                onClose={() => setManagingId(undefined)}
                onChanged={replaceTeam}
                onDeleted={(teamId) =>
                    setTeams((previous) => previous.filter((team) => team.id !== teamId))
                }
            />

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
