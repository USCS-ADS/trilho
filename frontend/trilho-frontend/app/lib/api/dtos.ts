/**
 * DTOs do backend (.NET), espelhando `Trilho.Communication`. O ASP.NET serializa
 * em camelCase. Mantenha em sincronia com os arquivos de origem indicados.
 */

/** Requests/Users/RequestUserLoginJson.cs */
export interface RequestUserLoginJson {
    email: string;
    password: string;
}

/** Responses/Users/ResponseUserLoginJson.cs */
export interface ResponseUserLoginJson {
    name: string;
    token: string;
}

/** Requests/Users/RequestUserJson.cs — `password` vazio no PUT mantém a senha atual. */
export interface RequestUserJson {
    name: string;
    email: string;
    password: string;
    role: string;
}

/** Responses/Users/ResponseUserJson.cs */
export interface ResponseUserJson {
    id: number;
    name: string;
    email: string;
    role: string;
}

/** Requests/Teams/RequestTeamJson.cs */
export interface RequestTeamJson {
    name: string;
    description: string;
    leaderId: number;
}

/** Responses/Teams/ResponseTeamJson.cs */
export interface ResponseTeamJson {
    id: number;
    name: string;
    description: string;
    isArchived: boolean;
    createdAt: string;
    leaderId: number;
    leader?: ResponseUserJson | null;
    memberCount: number;
    members: ResponseUserJson[];
    /** Tarefas em aberto do time. */
    openTasks: number;
    /** Carga de trabalho em % da capacidade estimada (RF08). */
    workloadPercent: number;
    isOverloaded: boolean;
}

/** Requests/Tasks/RequestTaskJson.cs */
export interface RequestTaskJson {
    title: string;
    description: string;
    teamId: number;
    assigneeId?: number | null;
    /** "YYYY-MM-DD" */
    dueDate?: string | null;
    priority: string;
    status?: string;
}

/** Requests/Tasks/RequestMoveTaskJson.cs */
export interface RequestMoveTaskJson {
    status: string;
    position: number;
}

/** Requests/Tasks/RequestUpdateSubtaskJson.cs */
export interface RequestUpdateSubtaskJson {
    title: string;
    isDone: boolean;
    assigneeId?: number | null;
}

/** Responses/Tasks/ResponseTaskSummaryJson.cs (cartão do Kanban) */
export interface ResponseTaskSummaryJson {
    id: number;
    title: string;
    status: string;
    priority: string;
    teamId: number;
    assigneeId?: number | null;
    dueDate?: string | null;
    isOverdue: boolean;
    position: number;
    subtasksTotal: number;
    subtasksDone: number;
    commentCount: number;
    gitBranch?: string | null;
    pullRequestNumber?: number | null;
    pullRequestState?: string | null;
}

export interface ResponseSubtaskJson {
    id: number;
    title: string;
    isDone: boolean;
    assigneeId?: number | null;
}

export interface ResponseCommentJson {
    id: number;
    authorId?: number | null;
    authorName: string;
    body: string;
    createdAt: string;
}

/** Responses/Tasks/ResponseTaskJson.cs (detalhe) */
export interface ResponseTaskJson {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    teamId: number;
    assigneeId?: number | null;
    createdById?: number | null;
    createdByName?: string | null;
    assigneeName?: string | null;
    dueDate?: string | null;
    isOverdue: boolean;
    createdAt: string;
    updatedAt: string;
    completedAt?: string | null;
    position: number;
    progress: number;
    git?: {
        branch: string;
        pullRequest?: { number: number; state: string } | null;
        lastCommitAt?: string | null;
    } | null;
    subtasks: ResponseSubtaskJson[];
    comments: ResponseCommentJson[];
}

/** Responses/Tasks/ResponseActivityJson.cs */
export interface ResponseActivityJson {
    id: number;
    type: string;
    actorId?: number | null;
    actorName: string;
    fromValue?: string | null;
    toValue?: string | null;
    createdAt: string;
}

/** Responses/Prioritization/ResponseRankedTaskJson.cs */
export interface ResponseRankedTaskJson {
    rank: number;
    taskId: number;
    title: string;
    assigneeId?: number | null;
    currentPriority: string;
    suggestedPriority: string;
    justification: string;
}

/** Responses/Prioritization/ResponsePrioritySuggestionJson.cs */
export interface ResponsePrioritySuggestionJson {
    priority: string;
    justification: string;
    suggestedAssignee?: { userId: number; name: string; openTasks: number } | null;
}

/** Requests/Invites/RequestInviteJson.cs */
export interface RequestInviteJson {
    email: string;
    fullName: string;
    teamId: number;
    role: string;
}

/** Responses/Invites/ResponseInviteJson.cs */
export interface ResponseInviteJson {
    id: number;
    email: string;
    fullName: string;
    teamId: number;
    teamName: string;
    role: string;
    expiresAt: string;
    createdAt: string;
}

/** Responses/Invites/ResponseInviteLookupJson.cs */
export interface ResponseInviteLookupJson {
    fullName: string;
    email: string;
    teamName: string;
    role: string;
}

/** Responses/Dashboard/ResponseDashboardJson.cs */
export interface ResponseDashboardJson {
    activeTasks: number;
    completedInCurrentSprint: number;
    overdueTasks: number;
    activeTeams: number;
    alertThresholdPercent: number;
    teamWorkloads: {
        teamId: number;
        teamName: string;
        workloadPercent: number;
        isOverloaded: boolean;
    }[];
    sprints: { label: string; startDate: string; endDate: string; completed: number; isCurrent: boolean }[];
}

/** Responses/Notifications/ResponseNotificationListJson.cs */
export interface ResponseNotificationListJson {
    unreadCount: number;
    notifications: {
        id: number;
        type: string;
        message: string;
        taskId?: number | null;
        createdAt: string;
        isRead: boolean;
    }[];
}

/** Responses/Prioritization/ResponseApplyRankingJson.cs */
export interface ResponseApplyRankingJson {
    updated: number;
    changes: { taskId: number; from: string; to: string }[];
}

/** Responses/Git/ResponseGitRepositoryJson.cs (a conexão devolve também `webhookSecret`) */
export interface ResponseGitRepositoryJson {
    id: number;
    provider: string;
    fullName: string;
    teamId: number;
    status: string;
    lastSyncAt?: string | null;
    events: string[];
    pendingEvents: number;
    webhookUrl: string;
    createdAt: string;
    webhookSecret?: string;
}

export interface ResponseGitRunJson {
    processed: number;
    failed: number;
}
