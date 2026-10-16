import { isMockMode } from "@/app/lib/api/config";
import { fetchTeams } from "@/app/lib/api/teams";
import { fetchUsers } from "@/app/lib/api/users";
import { toUserMessage } from "@/app/lib/api/errors";
import { getCurrentUser, verifySession } from "@/app/lib/session/dal";
import { USER_ROLES } from "@/app/lib/teams";
import type { TeamWithMembers } from "@/app/lib/teams/types";
import { SettingsWorkspace } from "./settings-workspace";

export default async function SettingsPage() {
  const session = await verifySession();
  const currentUser = await getCurrentUser();

  let users: Awaited<ReturnType<typeof fetchUsers>> = [];
  let teams: TeamWithMembers[] = [];
  let loadError: string | undefined;

  if (currentUser.role === "member") {
    // Membros não listam usuários (a API exige líder/admin): veem só o próprio perfil.
    users = [currentUser];
  } else {
    try {
      users = await fetchUsers(session.token);
    } catch (error) {
      loadError = toUserMessage(error);
    }
  }

  try {
    teams = await fetchTeams(session.token);
  } catch {
    // Sem times a coluna "Times" fica vazia; o erro principal é o de usuários.
  }

  return (
    <SettingsWorkspace
      currentUser={currentUser}
      initialUsers={users}
      loadError={loadError}
      isDemoData={isMockMode}
      assignableRoles={USER_ROLES}
      teams={teams.map((team) => ({
        id: team.id,
        name: team.name,
        memberIds: team.memberIds,
      }))}
    />
  );
}
