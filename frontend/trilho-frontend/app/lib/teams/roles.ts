export type UserRole = "admin" | "leader" | "member";

export const USER_ROLES: UserRole[] = ["admin", "leader", "member"];

/** Perfis de acesso do RF01. */
export const ROLE_LABELS: Record<UserRole, string> = {
    admin: "Administrador/Gestor",
    leader: "Líder de Time",
    member: "Membro",
};
