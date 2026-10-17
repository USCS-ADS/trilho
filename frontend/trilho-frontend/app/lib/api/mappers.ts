import type { Task, TaskActivity, TaskPriority, TaskStatus } from "../tasks/types";
import type { TeamWithMembers, User, UserRole } from "../teams";
import { formatRelative } from "../date";
import type {
    ResponseActivityJson,
    ResponseTaskJson,
    ResponseTaskSummaryJson,
    ResponseTeamJson,
    ResponseUserJson,
} from "./dtos";

/**
 * Perfis do backend (`Domain/Enum/Roles.cs`): "administrador", "lider" e "user".
 * O front os chama de admin / leader / member (RF01). Um valor desconhecido cai
 * no perfil de menor privilégio.
 */
const API_ROLES: Record<UserRole, string> = {
    admin: "administrador",
    leader: "lider",
    member: "user",
};

export function roleFromApi(apiRole: string): UserRole {
    const normalized = apiRole.trim().toLowerCase();

    if (normalized === API_ROLES.admin) return "admin";
    if (normalized === API_ROLES.leader) return "leader";
    return "member";
}

export function roleToApi(role: UserRole): string {
    return API_ROLES[role];
}

export function initialsOf(name: string): string {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "US";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function userFromApi(dto: ResponseUserJson): User {
    return {
        id: String(dto.id),
        name: dto.name,
        initials: initialsOf(dto.name),
        email: dto.email,
        role: roleFromApi(dto.role),
    };
}

export function teamFromApi(dto: ResponseTeamJson): TeamWithMembers {
    const members = dto.members.map(userFromApi);

    return {
        id: String(dto.id),
        name: dto.name,
        description: dto.description,
        leaderId: String(dto.leaderId),
        memberIds: members.map((member) => member.id),
        members,
        tasksInProgress: dto.openTasks,
        workload: dto.workloadPercent,
        isArchived: dto.isArchived,
    };
}

const idOf = (value: number | null | undefined) => (value == null ? undefined : String(value));

/** Cartão do board (resumo): sem subtarefas/comentários — só o necessário para as tags. */
export function taskFromSummary(dto: ResponseTaskSummaryJson): Task {
    return {
        id: String(dto.id),
        number: dto.id,
        title: dto.title,
        description: "",
        status: dto.status as TaskStatus,
        priority: dto.priority as TaskPriority,
        teamId: String(dto.teamId),
        assigneeId: idOf(dto.assigneeId),
        createdById: "",
        createdAt: "",
        dueDate: dto.dueDate ?? undefined,
        subtasks: [],
        comments: [],
        git: dto.gitBranch
            ? {
                  branch: dto.gitBranch,
                  pullRequest:
                      dto.pullRequestNumber != null
                          ? {
                                number: dto.pullRequestNumber,
                                state: dto.pullRequestState === "merged" ? "merged" : "open",
                            }
                          : undefined,
                  lastCommit: "",
              }
            : undefined,
    };
}

/** Detalhe completo da tarefa. */
export function taskFromDetail(dto: ResponseTaskJson): Task {
    return {
        id: String(dto.id),
        number: dto.id,
        title: dto.title,
        description: dto.description,
        status: dto.status as TaskStatus,
        priority: dto.priority as TaskPriority,
        teamId: String(dto.teamId),
        assigneeId: idOf(dto.assigneeId),
        createdById: idOf(dto.createdById) ?? "",
        createdByName: dto.createdByName ?? undefined,
        assigneeName: dto.assigneeName ?? undefined,
        createdAt: dto.createdAt.slice(0, 10),
        dueDate: dto.dueDate ?? undefined,
        subtasks: dto.subtasks.map((subtask) => ({
            id: String(subtask.id),
            title: subtask.title,
            done: subtask.isDone,
            assigneeId: idOf(subtask.assigneeId),
        })),
        comments: dto.comments.map((comment) => ({
            id: String(comment.id),
            authorId: idOf(comment.authorId),
            authorName: comment.authorName || undefined,
            body: comment.body,
        })),
        git: dto.git
            ? {
                  branch: dto.git.branch,
                  pullRequest: dto.git.pullRequest
                      ? {
                            number: dto.git.pullRequest.number,
                            state: dto.git.pullRequest.state === "merged" ? "merged" : "open",
                        }
                      : undefined,
                  lastCommit: dto.git.lastCommitAt ? formatRelative(dto.git.lastCommitAt) : "—",
              }
            : undefined,
    };
}

export function activityFromApi(dto: ResponseActivityJson): TaskActivity {
    return {
        id: String(dto.id),
        type: dto.type,
        actorName: dto.actorName || "Sistema",
        fromValue: dto.fromValue ?? undefined,
        toValue: dto.toValue ?? undefined,
        createdAt: dto.createdAt,
    };
}
