import { toUserMessage } from "@/app/lib/api/errors";
import { fetchRepositories } from "@/app/lib/api/git";
import { fetchTeams } from "@/app/lib/api/teams";
import type { GitRepository } from "@/app/lib/git-integrations/types";
import { getCurrentUser, verifySession } from "@/app/lib/session/dal";
import type { TeamWithMembers } from "@/app/lib/teams/types";
import { IntegrationsWorkspace } from "./integrations-workspace";

export default async function GitIntegrationsPage() {
  const session = await verifySession();
  const user = await getCurrentUser();

  let repositories: GitRepository[] = [];
  let teams: TeamWithMembers[] = [];
  let loadError: string | undefined;

  try {
    [repositories, teams] = await Promise.all([
      fetchRepositories(session.token),
      fetchTeams(session.token),
    ]);
  } catch (error) {
    loadError = toUserMessage(error);
  }

  // Conectar e configurar: administrador (qualquer time) ou líder do próprio time.
  const manageableTeams = teams.filter(
    (team) => user.role === "admin" || team.leaderId === user.id,
  );

  return (
    <IntegrationsWorkspace
      initialRepositories={repositories}
      teams={teams.map((team) => ({ id: team.id, name: team.name }))}
      manageableTeamIds={manageableTeams.map((team) => team.id)}
      loadError={loadError}
    />
  );
}
