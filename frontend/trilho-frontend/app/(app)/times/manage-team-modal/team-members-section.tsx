"use client";

import { Avatar } from "@/app/components/avatar";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { Select } from "@/app/components/select";
import { ROLE_LABELS } from "@/app/lib/teams/roles";
import type { TeamWithMembers, User } from "@/app/lib/teams/types";
import { useState } from "react";
import { addTeamMemberAction, removeTeamMemberAction } from "../actions";
import type { RunTeamAction } from "./types";

interface TeamMembersSectionProps {
    team: TeamWithMembers;
    /** Todas as pessoas que podem ser adicionadas. */
    users: User[];
    disabled: boolean;
    run: RunTeamAction;
}

export function TeamMembersSection({ team, users, disabled, run }: TeamMembersSectionProps) {
    const [selectedUserId, setSelectedUserId] = useState("");

    const addable = users.filter((user) => !team.memberIds.includes(user.id));

    async function handleAdd() {
        if (!selectedUserId) return;

        if (await run(() => addTeamMemberAction(team.id, selectedUserId))) setSelectedUserId("");
    }

    return (
        <section aria-labelledby="team-members-title">
            <h3 id="team-members-title" className="mb-2 text-xs font-medium uppercase tracking-wide text-trilho-dim">
                Membros ({team.members.length})
            </h3>

            <ul className="mb-3 flex flex-col divide-y divide-trilho-border rounded-lg border border-trilho-border">
                {team.members.map((member) => {
                    const isLeader = member.id === team.leaderId;

                    return (
                        <li key={member.id} className="flex items-center gap-3 px-3 py-2">
                            <Avatar initials={member.initials} size="sm" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm text-trilho-text">{member.name}</p>
                                <p className="truncate text-xs text-trilho-dim">{ROLE_LABELS[member.role]}</p>
                            </div>
                            {isLeader ? (
                                <Badge tone="accent">Líder</Badge>
                            ) : (
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => void run(() => removeTeamMemberAction(team.id, member.id))}
                                    aria-label={`Remover ${member.name} do time`}
                                    className="text-xs text-trilho-dim hover:text-trilho-danger hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Remover
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>

            <div className="flex items-end gap-2">
                <div className="flex-1">
                    <Select
                        name="newMember"
                        label="Adicionar membro"
                        value={selectedUserId}
                        onChange={(event) => setSelectedUserId(event.target.value)}
                        placeholder={addable.length ? "Selecione uma pessoa" : "Todos já estão no time"}
                        disabled={disabled || addable.length === 0}
                        options={addable.map((user) => ({ value: user.id, label: user.name }))}
                    />
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    className="mb-4 text-sm"
                    disabled={disabled || !selectedUserId}
                    onClick={handleAdd}
                >
                    Adicionar
                </Button>
            </div>
        </section>
    );
}
