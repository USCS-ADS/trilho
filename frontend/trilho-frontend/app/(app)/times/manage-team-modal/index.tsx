"use client";

import { Modal } from "@/app/components/modal";
import type { TeamWithMembers, User } from "@/app/lib/teams/types";
import { useState } from "react";
import type { TeamActionResult } from "../actions";
import { TeamDangerSection } from "./team-danger-section";
import { TeamDetailsSection } from "./team-details-section";
import { TeamLeaderSection } from "./team-leader-section";
import { TeamMembersSection } from "./team-members-section";
import type { RunTeamAction } from "./types";

interface ManageTeamModalProps {
    /** Time em edição; ausente = modal fechado. */
    team?: TeamWithMembers;
    users: User[];
    /** Quem pode assumir a liderança deste time (já filtrado pela tela). */
    leaderCandidates: User[];
    /** Administrador: troca líder, arquiva e exclui. Líder do time: só dados e membros. */
    isAdmin: boolean;
    onClose: () => void;
    onChanged: (team: TeamWithMembers) => void;
    onDeleted: (teamId: string) => void;
}

export function ManageTeamModal({
    team,
    users,
    leaderCandidates,
    isAdmin,
    onClose,
    onChanged,
    onDeleted,
}: ManageTeamModalProps) {
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState<string>();

    function handleClose() {
        setError(undefined);
        onClose();
    }

    /** Roda a ação no servidor, mostra o erro (se houver) e propaga o time atualizado. */
    const run: RunTeamAction = async (action) => {
        setIsBusy(true);
        setError(undefined);

        let result: TeamActionResult;
        try {
            result = await action();
        } finally {
            setIsBusy(false);
        }

        if (!result.ok) {
            setError(result.message);
            return false;
        }

        if (result.team) onChanged(result.team);
        return true;
    };

    return (
        <Modal open={Boolean(team)} onClose={handleClose} title="Gerenciar time">
            {team && (
                <div className="flex flex-col gap-6">
                    {team.isArchived && (
                        <p className="rounded-lg border border-trilho-warning/30 bg-trilho-warning/10 px-3 py-2 text-sm text-trilho-warning">
                            Este time está arquivado. Restaure-o para editar dados, membros ou liderança.
                        </p>
                    )}

                    <TeamDetailsSection
                        key={`${team.id}-${team.name}-${team.description}`}
                        team={team}
                        disabled={isBusy || Boolean(team.isArchived)}
                        run={run}
                    />

                    <TeamMembersSection
                        team={team}
                        users={users}
                        disabled={isBusy || Boolean(team.isArchived)}
                        run={run}
                    />

                    {isAdmin && (
                        <>
                            <TeamLeaderSection
                                key={team.leaderId}
                                team={team}
                                candidates={leaderCandidates}
                                disabled={isBusy || Boolean(team.isArchived)}
                                run={run}
                            />
                            <TeamDangerSection
                                team={team}
                                disabled={isBusy}
                                run={run}
                                onDeleted={() => {
                                    onDeleted(team.id);
                                    handleClose();
                                }}
                            />
                        </>
                    )}

                    {error && (
                        <p role="alert" className="text-sm text-trilho-danger">
                            {error}
                        </p>
                    )}
                </div>
            )}
        </Modal>
    );
}
