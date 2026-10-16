import { TEAMS, USERS } from "./mock-data";
import type { Team, TeamWithMembers, User } from "./types";

export type { NewInviteInput, NewTeamInput, Team, TeamWithMembers, User } from "./types";
export { ROLE_LABELS, USER_ROLES, type UserRole } from "./roles";
export { CAPACITY_THRESHOLD, getWorkloadTone } from "./workload";

// Costura para a API: hoje lê o mock; na integração, estas funções passam a
// chamar o backend (e viram assíncronas) sem tocar nas telas.

export function listUsers(): User[] {
    return USERS;
}

export function listTeams(): Team[] {
    return TEAMS;
}

export function getUserById(userId?: string): User | undefined {
    return USERS.find((user) => user.id === userId);
}

export function getTeamById(teamId: string): Team | undefined {
    return TEAMS.find((team) => team.id === teamId);
}

export function getTeamMembers(team: Team): User[] {
    return team.memberIds
        .map((memberId) => getUserById(memberId))
        .filter((user): user is User => user !== undefined);
}

export function listTeamsWithMembers(): TeamWithMembers[] {
    return TEAMS.map((team) => ({ ...team, members: getTeamMembers(team) }));
}
