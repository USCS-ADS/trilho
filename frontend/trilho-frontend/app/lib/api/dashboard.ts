import "server-only";
import type { DashboardData } from "../dashboard/types";
import { CAPACITY_THRESHOLD } from "../teams";
import type { UserRole } from "../teams";
import { apiFetch } from "./client";
import { isMockMode } from "./config";
import type { ResponseDashboardJson } from "./dtos";
import { ApiError } from "./errors";
import { fetchTeams } from "./teams";

/** Valores do modo demonstração (sem backend). */
const DEMO_DASHBOARD: DashboardData = {
    activeTasks: 21,
    activeTeams: 4,
    completedInCurrentSprint: 34,
    overdueTasks: 3,
    thresholdPercent: CAPACITY_THRESHOLD,
    workloads: [
        { id: "dados", name: "Dados", percent: 91 },
        { id: "backend", name: "Backend", percent: 78 },
        { id: "frontend", name: "Frontend", percent: 62 },
        { id: "machine-learning", name: "Machine Learning", percent: 54 },
    ],
    sprints: [
        { label: "S1", completed: 18, isCurrent: false },
        { label: "S2", completed: 22, isCurrent: false },
        { label: "S3", completed: 24, isCurrent: false },
        { label: "S4", completed: 30, isCurrent: false },
        { label: "S5", completed: 34, isCurrent: true },
    ],
};

/**
 * Consolidado (GET /api/Dashboard) para administrador e líder. O membro não tem acesso ao
 * consolidado: recebe uma visão reduzida montada a partir dos próprios times.
 */
export async function fetchDashboard(token: string, role: UserRole): Promise<DashboardData> {
    if (isMockMode) return DEMO_DASHBOARD;

    if (role === "member") {
        const teams = await fetchTeams(token);

        return {
            activeTasks: teams.reduce((total, team) => total + team.tasksInProgress, 0),
            activeTeams: teams.length,
            thresholdPercent: CAPACITY_THRESHOLD,
            workloads: teams
                .map((team) => ({ id: team.id, name: team.name, percent: team.workload }))
                .sort((a, b) => b.percent - a.percent),
        };
    }

    const dashboard = await apiFetch<ResponseDashboardJson>("/api/Dashboard", { token });
    if (!dashboard) throw new ApiError(502, []);

    return {
        activeTasks: dashboard.activeTasks,
        activeTeams: dashboard.activeTeams,
        completedInCurrentSprint: dashboard.completedInCurrentSprint,
        overdueTasks: dashboard.overdueTasks,
        thresholdPercent: dashboard.alertThresholdPercent,
        workloads: dashboard.teamWorkloads.map((team) => ({
            id: String(team.teamId),
            name: team.teamName,
            percent: team.workloadPercent,
        })),
        sprints: dashboard.sprints.map((sprint) => ({
            label: sprint.label,
            completed: sprint.completed,
            isCurrent: sprint.isCurrent,
        })),
    };
}
