import { rankTasks } from "@/app/lib/ai-suggestions/ranking";
import { isMockMode } from "@/app/lib/api/config";
import { toUserMessage } from "@/app/lib/api/errors";
import { fetchRanking } from "@/app/lib/api/prioritization";
import { fetchTeams } from "@/app/lib/api/teams";
import { listTasks, MOCK_TODAY } from "@/app/lib/tasks";
import type { TaskPriority } from "@/app/lib/tasks/types";
import { getCurrentUser, verifySession } from "@/app/lib/session/dal";
import type { TeamWithMembers } from "@/app/lib/teams/types";
import { PageHeader } from "@/app/components/page-header";
import { PriorityWorkspace } from "./priority-workspace";
import type { RankedTaskView } from "./types";

async function buildRankings(
  teams: TeamWithMembers[],
  token: string,
): Promise<Record<string, RankedTaskView[]>> {
  const initialsByUserId = Object.fromEntries(
    teams.flatMap((team) => team.members).map((member) => [member.id, member.initials]),
  );

  const entries = await Promise.all(
    teams.map(async (team): Promise<[string, RankedTaskView[]]> => {
      if (isMockMode) {
        const ranked = rankTasks(
          listTasks().filter((task) => task.teamId === team.id),
          MOCK_TODAY,
        );

        return [
          team.id,
          ranked.map(({ task, suggestedPriority, justification }) => ({
            id: task.id,
            title: task.title,
            href: `/kanban/${task.id}`,
            assigneeInitials: task.assigneeId ? initialsByUserId[task.assigneeId] : undefined,
            currentPriority: task.priority,
            suggestedPriority,
            justification,
          })),
        ];
      }

      const ranking = await fetchRanking(team.id, token);

      return [
        team.id,
        ranking.map((item) => ({
          id: String(item.taskId),
          title: item.title,
          href: `/kanban/${item.taskId}`,
          assigneeInitials: item.assigneeId != null ? initialsByUserId[String(item.assigneeId)] : undefined,
          currentPriority: item.currentPriority as TaskPriority,
          suggestedPriority: item.suggestedPriority as TaskPriority,
          justification: item.justification,
        })),
      ];
    }),
  );

  return Object.fromEntries(entries);
}

export default async function TasksPage(props: PageProps<"/tarefas">) {
  const session = await verifySession();
  const user = await getCurrentUser();
  const { team: requestedTeamId } = await props.searchParams;

  let teams: TeamWithMembers[] = [];
  let rankingsByTeam: Record<string, RankedTaskView[]> = {};
  let loadError: string | undefined;

  try {
    teams = await fetchTeams(session.token);
    rankingsByTeam = await buildRankings(teams, session.token);
  } catch (error) {
    loadError = toUserMessage(error);
  }

  if (teams.length === 0) {
    return (
      <>
        <PageHeader title="Sugestão de Priorização por IA" />
        <p className="p-8 text-sm text-trilho-dim" role={loadError ? "alert" : undefined}>
          {loadError ?? "Você ainda não participa de nenhum time."}
        </p>
      </>
    );
  }

  const requested = typeof requestedTeamId === "string" ? requestedTeamId : undefined;
  const defaultTeam = teams.find((team) => team.id === requested) ?? teams[0];

  // RF07: aplicar é decisão da liderança — administrador (todos os times) ou líder do próprio time.
  const applicableTeamIds = teams
    .filter((team) => user.role === "admin" || team.leaderId === user.id)
    .map((team) => team.id);

  return (
    <PriorityWorkspace
      teams={teams.map((team) => ({ id: team.id, name: team.name }))}
      defaultTeamId={defaultTeam.id}
      rankingsByTeam={rankingsByTeam}
      applicableTeamIds={applicableTeamIds}
    />
  );
}
