import { toUserMessage } from "@/app/lib/api/errors";
import { fetchTeams } from "@/app/lib/api/teams";
import { fetchUsers } from "@/app/lib/api/users";
import { getCurrentUser, verifySession } from "@/app/lib/session/dal";
import type { TeamWithMembers, User } from "@/app/lib/teams/types";
import { TeamsWorkspace } from "./teams-workspace";

/** Quem não pode listar usuários (membro) enxerga só as pessoas dos próprios times. */
function usersFromTeams(teams: TeamWithMembers[]): User[] {
  const byId = new Map<string, User>();
  for (const team of teams) {
    for (const member of team.members) byId.set(member.id, member);
  }
  return [...byId.values()];
}

export default async function TeamsPage() {
  const session = await verifySession();
  const currentUser = await getCurrentUser();

  let teams: TeamWithMembers[] = [];
  let loadError: string | undefined;

  try {
    // O administrador também vê os times arquivados (para restaurá-los).
    teams = await fetchTeams(session.token, { includeArchived: currentUser.role === "admin" });
  } catch (error) {
    loadError = toUserMessage(error);
  }

  let users = usersFromTeams(teams);

  if (currentUser.role === "admin" || currentUser.role === "leader") {
    try {
      users = await fetchUsers(session.token);
    } catch {
      // Mantém a lista derivada dos times.
    }
  }

  return (
    <TeamsWorkspace
      initialTeams={teams}
      users={users}
      canCreateTeam={currentUser.role === "admin"}
      currentUser={{ id: currentUser.id, role: currentUser.role }}
      loadError={loadError}
    />
  );
}
