import type { UserRole } from "@/app/lib/teams/roles";

/** Linha da tabela de pessoas: usuário ativo ou convite pendente. */
export interface PersonRow {
    id: string;
    name: string;
    initials: string;
    email: string;
    role: UserRole;
    teamNames: string[];
    status: "active" | "invited";
}
