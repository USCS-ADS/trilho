export type TaskStatus = "backlog" | "todo" | "in-progress" | "in-review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Subtask {
    id: string;
    title: string;
    done: boolean;
    assigneeId?: string;
}

export interface TaskComment {
    id: string;
    authorId?: string;
    /** Nome do autor, quando a origem já o informa (API); senão resolve-se por `authorId`. */
    authorName?: string;
    body: string;
}

/** Entrada do histórico da tarefa (RF05). */
export interface TaskActivity {
    id: string;
    type: string;
    actorName: string;
    fromValue?: string;
    toValue?: string;
    /** Instante ISO (UTC). */
    createdAt: string;
}

export interface TaskGitLink {
    branch: string;
    pullRequest?: { number: number; state: "open" | "merged" };
    /** Texto relativo já formatado (ex: "há 3 horas"); virá do webhook do provedor Git. */
    lastCommit: string;
}

export interface TaskAiSuggestion {
    priority: TaskPriority;
    /** Justificativa em linguagem simples (RF07). */
    justification: string;
}

export interface Task {
    id: string;
    number: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    teamId: string;
    /** Sem responsável = tarefa do time inteiro (RF03). */
    assigneeId?: string;
    createdById: string;
    /** Nomes já resolvidos pela API (o criador pode não ser membro do time). */
    createdByName?: string;
    assigneeName?: string;
    /** Datas em ISO (YYYY-MM-DD). */
    createdAt: string;
    dueDate?: string;
    subtasks: Subtask[];
    comments: TaskComment[];
    git?: TaskGitLink;
    aiSuggestion?: TaskAiSuggestion;
}

/** O que o modal "Nova tarefa" produz; o backend completa id, número, autor e datas. */
export interface NewTaskInput {
    title: string;
    description: string;
    teamId: string;
    assigneeId?: string;
    dueDate?: string;
    priority: TaskPriority;
}
