import { rankTasks } from "@/app/lib/ai-suggestions/ranking";
import { listTasks, MOCK_TODAY } from "@/app/lib/tasks";
import { getUserById, listTeams } from "@/app/lib/teams";
import { PriorityWorkspace } from "./priority-workspace";
import type { RankedTaskView } from "./types";

// TODO: usar o time do usuário autenticado como padrão.
const DEFAULT_TEAM_ID = "backend";

export default function TasksPage() {
  const teams = listTeams();
  const tasks = listTasks();

  const rankingsByTeam: Record<string, RankedTaskView[]> = Object.fromEntries(
    teams.map((team) => [
      team.id,
      rankTasks(
        tasks.filter((task) => task.teamId === team.id),
        MOCK_TODAY,
      ).map(({ task, suggestedPriority, justification }) => ({
        id: task.id,
        title: task.title,
        href: `/kanban/${task.id}`,
        assigneeInitials: getUserById(task.assigneeId)?.initials,
        currentPriority: task.priority,
        suggestedPriority,
        justification,
      })),
    ]),
  );

  return (
    <PriorityWorkspace
      teams={teams.map((team) => ({ id: team.id, name: team.name }))}
      defaultTeamId={DEFAULT_TEAM_ID}
      rankingsByTeam={rankingsByTeam}
    />
  );
}
