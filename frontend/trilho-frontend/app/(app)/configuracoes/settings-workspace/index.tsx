"use client";

import { PageHeader } from "@/app/components/page-header";
import type { UserRole } from "@/app/lib/teams/roles";
import type { NewInviteInput, PendingInvite, User } from "@/app/lib/teams/types";
import { useMemo, useRef, useState } from "react";
import {
    cancelInviteAction,
    changeUserRole,
    createUserAction,
    deleteUserAction,
    inviteUserAction,
    setUserActiveAction,
} from "../actions";
import { CreateUserModal } from "../create-user-modal";
import type { NewUserInput } from "../create-user-modal/create-user-form";
import { InviteUserModal } from "../invite-user-modal";
import { PasswordCard } from "../password-card";
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
    /** Administrador e líder convidam; membro não vê o botão. */
    canInvite: boolean;
    /** Perfis e times que o usuário pode usar ao convidar (líder: só Membro e os times que lidera). */
    inviteRoles: UserRole[];
    inviteTeams: { id: string; name: string }[];
    initialInvites: PendingInvite[];
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
    canInvite,
    inviteRoles,
    inviteTeams,
    initialInvites,
}: SettingsWorkspaceProps) {
    const [users, setUsers] = useState(initialUsers);
    const [invites, setInvites] = useState<PendingInvite[]>(initialInvites);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
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
            status: user.isActive === false ? "inactive" : "active",
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

    async function handleSetActive(userId: string, isActive: boolean) {
        setActionError(undefined);

        // Otimista: atualiza a tela e desfaz se o servidor recusar (ex.: usuário lidera um time).
        setUsers((previous) =>
            previous.map((user) => (user.id === userId ? { ...user, isActive } : user)),
        );

        const result = await setUserActiveAction(userId, isActive);
        if (!result.ok) {
            setActionError(result.message);
            setUsers((previous) =>
                previous.map((user) =>
                    user.id === userId ? { ...user, isActive: !isActive } : user,
                ),
            );
        }
    }

    async function handleDelete(userId: string) {
        setActionError(undefined);

        const result = await deleteUserAction(userId);
        if (!result.ok) {
            setActionError(result.message);
            return;
        }

        setUsers((previous) => previous.filter((user) => user.id !== userId));
    }

    /** Devolve a mensagem de erro (ou `undefined` se criou) para o modal exibir. */
    async function handleCreateUser(input: NewUserInput): Promise<string | undefined> {
        const result = await createUserAction(input);
        if (!result.ok) return result.message;

        setUsers((previous) => [...previous, result.user]);
        return undefined;
    }

    /** Devolve a mensagem de erro (ou `undefined` se enviou) para o modal exibir. */
    async function handleInvite(input: NewInviteInput): Promise<string | undefined> {
        const result = await inviteUserAction(input);
        if (!result.ok) return result.message;

        // Reenvio para o mesmo e-mail/time substitui o convite anterior na API.
        let invite = result.invite;

        if (!invite) {
            // Modo demonstração (sem API): o convite existe só no cliente.
            localIdCounter.current += 1;
            invite = { ...input, id: `local-invite-${localIdCounter.current}` };
        }

        const created = invite;
        setInvites((previous) => [
            ...previous.filter(
                (item) => !(item.email === created.email && item.teamId === created.teamId),
            ),
            created,
        ]);
        return undefined;
    }

    async function handleCancelInvite(inviteId: string) {
        setActionError(undefined);

        const result = await cancelInviteAction(inviteId);
        if (!result.ok) {
            setActionError(result.message);
            return;
        }

        setInvites((previous) => previous.filter((invite) => invite.id !== inviteId));
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
                        canInvite={canInvite}
                        onInvite={() => setIsInviteOpen(true)}
                        onCancelInvite={canInvite ? handleCancelInvite : undefined}
                        onRoleChange={handleRoleChange}
                        canCreateUser={currentRole === "admin" && !isDemoData}
                        onCreateUser={() => setIsCreateOpen(true)}
                        canManageUsers={currentRole === "admin" && !isDemoData}
                        currentUserId={currentUser.id}
                        onSetActive={handleSetActive}
                        onDelete={handleDelete}
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <ProfileCard name={currentUser.name} email={currentUser.email} />
                    {!isDemoData && <PasswordCard />}
                </div>
            </div>

            <CreateUserModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreate={handleCreateUser}
                roles={assignableRoles}
                existingEmails={existingEmails}
            />

            <InviteUserModal
                open={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onInvite={handleInvite}
                teams={inviteTeams}
                roles={inviteRoles}
                existingEmails={existingEmails}
            />
        </>
    );
}
