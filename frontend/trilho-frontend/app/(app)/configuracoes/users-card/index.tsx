import { Avatar } from "@/app/components/avatar";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { Card, CardTitle } from "@/app/components/card";
import { controlClasses } from "@/app/components/form-field";
import { PlusIcon } from "@/app/components/icons";
import { ROLE_LABELS, type UserRole } from "@/app/lib/teams/roles";
import { useState } from "react";
import type { PersonRow } from "../types";

interface UsersCardProps {
    people: PersonRow[];
    /** Perfis que podem ser atribuídos (a API pode suportar menos que o RF01). */
    roles: UserRole[];
    /** Oculta a coluna de times quando não há dados de time casáveis com os usuários. */
    showTeams: boolean;
    /** RF01: só Administradores alteram o perfil de acesso de outros usuários. */
    canManageRoles: boolean;
    /** Administrador e líder convidam; para os demais o botão some. */
    canInvite: boolean;
    onInvite: () => void;
    /** Cancela um convite pendente (só quando quem vê pode convidar). */
    onCancelInvite?: (inviteId: string) => void;
    onRoleChange: (userId: string, role: UserRole) => void;
    /** Só administrador cria usuário direto (sem convite). */
    canCreateUser: boolean;
    onCreateUser: () => void;
    /** Só administrador ativa/desativa/exclui; o próprio usuário nunca aparece com essas ações. */
    canManageUsers: boolean;
    currentUserId: string;
    onSetActive: (userId: string, isActive: boolean) => void;
    onDelete: (userId: string) => void;
}

const STATUS_LABELS: Record<PersonRow["status"], string> = {
    active: "Ativo",
    inactive: "Inativo",
    invited: "Convite pendente",
};

export function UsersCard({
    people,
    roles,
    showTeams,
    canManageRoles,
    canInvite,
    onInvite,
    onCancelInvite,
    onRoleChange,
    canCreateUser,
    onCreateUser,
    canManageUsers,
    currentUserId,
    onSetActive,
    onDelete,
}: UsersCardProps) {
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string>();

    return (
        <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
                <CardTitle className="mb-0">Usuários e perfis de acesso</CardTitle>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {canCreateUser && (
                        <Button type="button" variant="secondary" className="gap-1.5 text-sm" onClick={onCreateUser}>
                            <PlusIcon className="h-4 w-4" />
                            Criar usuário
                        </Button>
                    )}
                    {canInvite && (
                        <Button type="button" className="gap-1.5 text-sm" onClick={onInvite}>
                            <PlusIcon className="h-4 w-4" />
                            Convidar usuário
                        </Button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] text-left text-sm">
                    <thead>
                        <tr className="border-b border-trilho-border text-xs uppercase tracking-wide text-trilho-dim">
                            <th scope="col" className="pb-2 font-medium">Pessoa</th>
                            {showTeams && (
                                <th scope="col" className="pb-2 font-medium">Times</th>
                            )}
                            <th scope="col" className="pb-2 font-medium">Perfil</th>
                            <th scope="col" className="pb-2 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-trilho-border">
                        {people.map((person) => (
                            <tr key={person.id}>
                                <td className="py-3 pr-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar initials={person.initials} />
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-trilho-text">
                                                {person.name}
                                            </p>
                                            <p className="truncate text-xs text-trilho-dim">
                                                {person.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                {showTeams && (
                                    <td className="py-3 pr-4 text-trilho-dim">
                                        {person.teamNames.length ? person.teamNames.join(", ") : "—"}
                                    </td>
                                )}
                                <td className="py-3 pr-4">
                                    {canManageRoles && person.status !== "invited" ? (
                                        <select
                                            aria-label={`Perfil de ${person.name}`}
                                            value={person.role}
                                            onChange={(event) =>
                                                onRoleChange(person.id, event.target.value as UserRole)
                                            }
                                            className={`${controlClasses(false)} w-auto py-1 text-xs`}
                                        >
                                            {roles.map((role) => (
                                                <option key={role} value={role}>
                                                    {ROLE_LABELS[role]}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-trilho-text">
                                            {ROLE_LABELS[person.role]}
                                        </span>
                                    )}
                                </td>
                                <td className="py-3">
                                    <div className="flex items-center gap-3">
                                        <Badge tone={person.status === "active" ? "success" : "warning"}>
                                            {STATUS_LABELS[person.status]}
                                        </Badge>
                                        {canManageUsers && person.status !== "invited" && person.id !== currentUserId && (
                                            confirmingDeleteId === person.id ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setConfirmingDeleteId(undefined);
                                                            onDelete(person.id);
                                                        }}
                                                        aria-label={`Confirmar exclusão de ${person.name}`}
                                                        className="text-xs font-medium text-trilho-danger hover:underline"
                                                    >
                                                        Confirmar exclusão
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfirmingDeleteId(undefined)}
                                                        className="text-xs text-trilho-dim hover:underline"
                                                    >
                                                        Voltar
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => onSetActive(person.id, person.status !== "active")}
                                                        aria-label={`${person.status === "active" ? "Desativar" : "Reativar"} ${person.name}`}
                                                        className="text-xs text-trilho-dim hover:text-trilho-text hover:underline"
                                                    >
                                                        {person.status === "active" ? "Desativar" : "Reativar"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfirmingDeleteId(person.id)}
                                                        aria-label={`Excluir ${person.name}`}
                                                        className="text-xs text-trilho-dim hover:text-trilho-danger hover:underline"
                                                    >
                                                        Excluir
                                                    </button>
                                                </>
                                            )
                                        )}
                                        {person.status === "invited" && onCancelInvite && (
                                            <button
                                                type="button"
                                                onClick={() => onCancelInvite(person.id)}
                                                aria-label={`Cancelar convite de ${person.name}`}
                                                className="text-xs text-trilho-dim hover:text-trilho-danger hover:underline"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
