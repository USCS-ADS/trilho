import { isMockMode } from "@/app/lib/api/config";
import { toUserMessage } from "@/app/lib/api/errors";
import { fetchTeams } from "@/app/lib/api/teams";
import { fetchAssigneeSuggestion, fetchTeamTasks } from "@/app/lib/api/tasks";
import type { AssigneeSuggestion } from "@/app/lib/ai-suggestions/assignee";
import { suggestAssignee } from "@/app/lib/ai-suggestions/assignee";
import { todayIso } from "@/app/lib/date";
import { verifySession } from "@/app/lib/session/dal";
import { MOCK_TODAY } from "@/app/lib/tasks";
import type { TeamWithMembers } from "@/app/lib/teams/types";
import { PageHeader } from "@/app/components/page-header";
import { buildColumns } from "./kanban-board/build-columns";
import { KanbanWorkspace } from "./kanban-workspace";

export default async function KanbanPage(props: PageProps<"/kanban">) {
  const session = await verifySession();
  const { team: requestedTeamId } = await props.searchParams;

  let teams: TeamWithMembers[] = [];
  let loadError: string | undefined;

  try {
    teams = await fetchTeams(session.token);
  } catch (error) {
    loadError = toUserMessage(error);
  }

  // Times arquivados não têm quadro ativo; o time vem de ?team= ou é o primeiro disponível.
  const requested = typeof requestedTeamId === "string" ? requestedTeamId : undefined;
  const team = teams.find((candidate) => candidate.id === requested) ?? teams[0];

  if (!team) {
    return (
      <>
        <PageHeader title="Quadro Kanban" description="Nenhum time disponível" />
        <p className="p-8 text-sm text-trilho-dim" role={loadError ? "alert" : undefined}>
          {loadError ?? "Você ainda não participa de nenhum time. Peça a um líder para adicioná-lo."}
        </p>
      </>
    );
  }

  // No modo demonstração o "hoje" é fixo (os dados fictícios têm datas de agosto de 2026).
  const today = isMockMode ? MOCK_TODAY : todayIso();
  const tasks = await fetchTeamTasks(team.id, session.token);

  const initialsByUserId = Object.fromEntries(
    teams.flatMap((candidate) => candidate.members).map((member) => [member.id, member.initials]),
  );

  const suggestionEntries = await Promise.all(
    teams.map(async (candidate): Promise<[string, AssigneeSuggestion | undefined]> => {
      if (isMockMode) return [candidate.id, suggestAssignee(candidate)];
      return [candidate.id, await fetchAssigneeSuggestion(candidate.id, session.token)];
    }),
  );

  return (
    <KanbanWorkspace
      // O estado do board é local; trocar de time precisa remontar com os dados novos.
      key={team.id}
      initialColumns={buildColumns(tasks, today, initialsByUserId)}
      team={{
        id: team.id,
        name: team.name,
        memberCount: team.members.length,
        leaderName: team.members.find((member) => member.id === team.leaderId)?.name ?? "—",
      }}
      teamOptions={teams.map((candidate) => ({ id: candidate.id, name: candidate.name }))}
      teams={teams}
      assigneeSuggestions={Object.fromEntries(suggestionEntries)}
      today={today}
    />
  );
}
