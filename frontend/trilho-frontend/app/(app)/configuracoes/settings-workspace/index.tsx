"use client";

import { PageHeader } from "@/app/components/page-header";
import type { UserRole } from "@/app/lib/teams/roles";
import type { NewInviteInput, User } from "@/app/lib/teams/types";
import { useMemo, useRef, useState } from "react";
import { changeUserRole } from "../actions";
import { InviteUserModal } from "../invite-user-modal";
import { ProfileCard } from "../profile-card";
import type { PersonRow } from "../types";
import { UsersCard } from "../users-card";

interface SettingsWorkspaceProps {
    currentUser: User;
    initialUsers: User[];
    teams: { id: string; name: string; memberIds: string[] }[];
    /** Perfis que a API sabe gravar (em modo real, só Administrador e Membro). */
    assignableRoles: UserRole[];
    /** Erro ao carregar a lista de usuários da API. */
    loadError?: string;
    /** Modo demonstração: usuários e times simulados. */
    isDemoData: boolean;
}

interface PendingInvite extends NewInviteInput {
    id: string;
}

function initialsFromName(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

/** Estado compartilhado entre a lista de pessoas, o convite e o perfil do usuário. */
export function SettingsWorkspace({
    currentUser,
    initialUsers,
    teams,
    assignableRoles,
    loadError,
    isDemoData,
}: SettingsWorkspaceProps) {
    const [users, setUsers] = useState(initialUsers);
    const [invites, setInvites] = useState<PendingInvite[]>([]);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [actionError, setActionError] = useState<string | undefined>();
    const localIdCounter = useRef(0);

    const people = useMemo<PersonRow[]>(() => {
        const activeRows = users.map<PersonRow>((user) => ({
            id: user.id,
            name: user.name,
            initials: user.initials,
            email: user.email,
            role: user.role,
            teamNames: teams
                .filter((team) => team.memberIds.includes(user.id))
                .map((team) => team.name),
            status: "active",
        }));

        const inviteRows = invites.map<PersonRow>((invite) => ({
            id: invite.id,
            name: invite.fullName,
            initials: initialsFromName(invite.fullName),
            email: invite.email,
            role: invite.role,
            teamNames: teams.filter((team) => team.id === invite.teamId).map((team) => team.name),
            status: "invited",
        }));

        return [...activeRows, ...inviteRows];
    }, [users, invites, teams]);

    const existingEmails = people.map((person) => person.email.toLowerCase());
    const currentRole = users.find((user) => user.id === currentUser.id)?.role ?? currentUser.role;

    async function handleRoleChange(userId: string, role: UserRole) {
        const previousRole = users.find((user) => user.id === userId)?.role;
        setActionError(undefined);

        // Otimista: atualiza a tela e desfaz se o servidor recusar.
        setUsers((previous) =>
            previous.map((user) => (user.id === userId ? { ...user, role } : user)),
        );

        const result = await changeUserRole(userId, role);
        if (!result.ok) {
            setActionError(result.message);
            if (previousRole) {
                setUsers((previous) =>
                    previous.map((user) =>
                        user.id === userId ? { ...user, role: previousRole } : user,
                    ),
                );
            }
        }
    }

    function handleInvite(input: NewInviteInput) {
        // TODO: o backend ainda não tem endpoint de convite por e-mail (RF01); fica só no cliente.
        localIdCounter.current += 1;
        setInvites((previous) => [
            ...previous,
            { ...input, id: `local-invite-${localIdCounter.current}` },
        ]);
    }

    return (
        <>
            <PageHeader title="Configurações" description="Usuários, perfis de acesso e seu perfil" />

            <div className="grid gap-6 p-4 sm:p-8 xl:grid-cols-3">
                <div className="flex flex-col gap-4 xl:col-span-2">
                    {(loadError || actionError) && (
                        <p
                            role="alert"
                            className="rounded-lg border border-trilho-danger/30 bg-trilho-danger/10 px-3 py-2 text-sm text-trilho-danger"
                        >
                            {loadError ?? actionError}
                        </p>
                    )}

                    <UsersCard
                        people={people}
                        roles={assignableRoles}
                        canManageRoles={currentRole === "admin"}
                        showTeams={isDemoData}
                        onInvite={() => setIsInviteOpen(true)}
                        onRoleChange={handleRoleChange}
                    />
                </div>

                <ProfileCard name={currentUser.name} email={currentUser.email} />
            </div>

            <InviteUserModal
                open={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onInvite={handleInvite}
                teams={teams.map((team) => ({ id: team.id, name: team.name }))}
                roles={assignableRoles}
                existingEmails={existingEmails}
            />
        </>
    );
}
