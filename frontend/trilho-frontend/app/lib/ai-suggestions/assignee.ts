import { listTasks } from "../tasks";
import { getTeamMembers, type Team } from "../teams";

export interface AssigneeSuggestion {
    userId: string;
    name: string;
    openTasks: number;
}

/**
 * Mock da sugestão de responsável (RF07): o membro com menos tarefas em aberto.
 * TODO: substituir pela chamada ao módulo de IA.
 */
export function suggestAssignee(team: Team): AssigneeSuggestion | undefined {
    const tasks = listTasks();

    const candidates = getTeamMembers(team).map((member) => ({
        userId: member.id,
        name: member.name,
        openTasks: tasks.filter(
            (task) => task.assigneeId === member.id && task.status !== "done",
        ).length,
    }));

    return candidates.sort((a, b) => a.openTasks - b.openTasks)[0];
}
