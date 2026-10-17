import { isMockMode } from "@/app/lib/api/config";
import { fetchPendingInvites } from "@/app/lib/api/invites";
import { fetchTeams } from "@/app/lib/api/teams";
import { fetchUsers } from "@/app/lib/api/users";
import { toUserMessage } from "@/app/lib/api/errors";
import { getCurrentUser, verifySession } from "@/app/lib/session/dal";
import { USER_ROLES } from "@/app/lib/teams";
import type { PendingInvite, TeamWithMembers } from "@/app/lib/teams/types";
import { SettingsWorkspace } from "./settings-workspace";

export default async function SettingsPage() {
  const session = await verifySession();
  const currentUser = await getCurrentUser();

  let users: Awaited<ReturnType<typeof fetchUsers>> = [];
  let teams: TeamWithMembers[] = [];
  let invites: PendingInvite[] = [];
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

  const canInvite = currentUser.role === "admin" || currentUser.role === "leader";

  if (canInvite) {
    try {
      invites = await fetchPendingInvites(session.token);
    } catch {
      // Sem a lista de pendentes a tela segue; o convite novo continua funcionando.
    }
  }

  // Administrador convida para qualquer time e perfil; líder só para o próprio time, como Membro.
  const inviteTeams =
    currentUser.role === "admin" ? teams : teams.filter((team) => team.leaderId === currentUser.id);
  const inviteRoles = currentUser.role === "admin" ? USER_ROLES : (["member"] as typeof USER_ROLES);

  return (
    <SettingsWorkspace
      currentUser={currentUser}
      initialUsers={users}
      loadError={loadError}
      isDemoData={isMockMode}
      assignableRoles={USER_ROLES}
      canInvite={canInvite}
      inviteRoles={inviteRoles}
      inviteTeams={inviteTeams.map((team) => ({ id: team.id, name: team.name }))}
      initialInvites={invites}
      teams={teams.map((team) => ({
        id: team.id,
        name: team.name,
        memberIds: team.memberIds,
      }))}
    />
  );
}
