"use client";

import { Button } from "@/app/components/button";
import { Select } from "@/app/components/select";
import type { TeamWithMembers, User } from "@/app/lib/teams/types";
import { useState } from "react";
import { changeTeamLeaderAction } from "../actions";
import type { RunTeamAction } from "./types";

interface TeamLeaderSectionProps {
    team: TeamWithMembers;
    /** Quem pode liderar este time: perfil líder/administrador e sem outro time ativo. */
    candidates: User[];
    disabled: boolean;
    run: RunTeamAction;
}

/** RF02: só o administrador troca o líder; o anterior continua como membro. */
export function TeamLeaderSection({ team, candidates, disabled, run }: TeamLeaderSectionProps) {
    const [leaderId, setLeaderId] = useState("");

    return (
        <section aria-labelledby="team-leader-title">
            <h3 id="team-leader-title" className="mb-2 text-xs font-medium uppercase tracking-wide text-trilho-dim">
                Liderança
            </h3>

            <div className="flex items-end gap-2">
                <div className="flex-1">
                    <Select
                        name="newLeader"
                        label="Novo líder"
                        value={leaderId}
                        onChange={(event) => setLeaderId(event.target.value)}
                        placeholder={candidates.length ? "Selecione o novo líder" : "Nenhum candidato disponível"}
                        disabled={disabled || candidates.length === 0}
                        options={candidates.map((user) => ({ value: user.id, label: user.name }))}
                    />
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    className="mb-4 text-sm"
                    disabled={disabled || !leaderId}
                    onClick={async () => {
                        if (await run(() => changeTeamLeaderAction(team.id, leaderId))) setLeaderId("");
                    }}
                >
                    Trocar líder
                </Button>
            </div>
        </section>
    );
}
