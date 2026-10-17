import type { UserRole } from "./roles";

export interface User {
    id: string;
    name: string;
    initials: string;
    email: string;
    role: UserRole;
}

export interface Team {
    id: string;
    name: string;
    description: string;
    leaderId: string;
    memberIds: string[];
    /** Hoje mockado; virá calculado pelo backend (tarefas em aberto no board do time). */
    tasksInProgress: number;
    /** Carga de trabalho em % da capacidade estimada (RF08). Mockado, idem acima. */
    workload: number;
}

export interface TeamWithMembers extends Team {
    members: User[];
}

export interface NewTeamInput {
    name: string;
    description: string;
    leaderId: string;
    memberIds: string[];
}

/** Convite enviado por e-mail (RF01: não há autocadastro público). */
export interface NewInviteInput {
    fullName: string;
    email: string;
    teamId: string;
    role: UserRole;
}

/** Convite já registrado na API e ainda não aceito. */
export interface PendingInvite extends NewInviteInput {
    id: string;
}
