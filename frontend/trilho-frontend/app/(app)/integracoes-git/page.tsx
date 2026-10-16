import { listRepositories } from "@/app/lib/git-integrations";
import { listTeams } from "@/app/lib/teams";
import { IntegrationsWorkspace } from "./integrations-workspace";

export default function GitIntegrationsPage() {
  return (
    <IntegrationsWorkspace
      initialRepositories={listRepositories()}
      teams={listTeams().map((team) => ({ id: team.id, name: team.name }))}
    />
  );
}
