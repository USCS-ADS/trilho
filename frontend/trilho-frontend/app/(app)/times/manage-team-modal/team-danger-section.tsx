"use client";

import { Button } from "@/app/components/button";
import type { TeamWithMembers } from "@/app/lib/teams/types";
import { useState } from "react";
import { archiveTeamAction, deleteTeamAction, restoreTeamAction } from "../actions";
import type { RunTeamAction } from "./types";

interface TeamDangerSectionProps {
    team: TeamWithMembers;
    disabled: boolean;
    run: RunTeamAction;
    /** Chamado depois que o time foi excluído no servidor. */
    onDeleted: () => void;
}

/** Arquivar (reversível) e excluir (só sem tarefas — a API orienta a arquivar). Somente administrador. */
export function TeamDangerSection({ team, disabled, run, onDeleted }: TeamDangerSectionProps) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    async function handleDelete() {
        if (await run(() => deleteTeamAction(team.id))) onDeleted();
    }

    return (
        <section aria-labelledby="team-danger-title" className="rounded-lg border border-trilho-danger/30 p-3">
            <h3 id="team-danger-title" className="mb-2 text-xs font-medium uppercase tracking-wide text-trilho-danger">
                Arquivar ou excluir
            </h3>

            <p className="mb-3 text-sm text-trilho-dim">
                Arquivar esconde o time do quadro e das listas sem apagar o histórico, e pode ser desfeito.
                Excluir só é possível para times sem tarefas.
            </p>

            <div className="flex flex-wrap items-center gap-2">
                {team.isArchived ? (
                    <Button
                        type="button"
                        variant="secondary"
                        className="text-sm"
                        disabled={disabled}
                        onClick={() => void run(() => restoreTeamAction(team.id))}
                    >
                        Restaurar time
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="secondary"
                        className="text-sm"
                        disabled={disabled}
                        onClick={() => void run(() => archiveTeamAction(team.id))}
                    >
                        Arquivar time
                    </Button>
                )}

                {confirmingDelete ? (
                    <>
                        <Button type="button" variant="danger" className="text-sm" disabled={disabled} onClick={handleDelete}>
                            Confirmar exclusão
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            className="text-sm"
                            onClick={() => setConfirmingDelete(false)}
                        >
                            Cancelar
                        </Button>
                    </>
                ) : (
                    <Button
                        type="button"
                        variant="danger"
                        className="text-sm"
                        disabled={disabled}
                        onClick={() => setConfirmingDelete(true)}
                    >
                        Excluir time
                    </Button>
                )}
            </div>
        </section>
    );
}
