// TODO: substituir por dados reais da API (board, colunas e cards do time).

export type KanbanTagTone = "danger" | "warning" | "neutral" | "info" | "ai" | "success";

export interface KanbanTag {
    label: string;
    tone: KanbanTagTone;
}

export interface KanbanCardData {
    id: string;
    title: string;
    tags: KanbanTag[];
    assigneeInitials: string;
}

export interface KanbanColumnData {
    id: string;
    label: string;
    cards: KanbanCardData[];
}

export const INITIAL_COLUMNS: KanbanColumnData[] = [
    {
        id: "backlog",
        label: "Backlog",
        cards: [
            {
                id: "backlog-1",
                title: "Criar endpoint de exportação de relatórios",
                tags: [{ label: "P3", tone: "neutral" }],
                assigneeInitials: "RC",
            },
            {
                id: "backlog-2",
                title: "Revisar índices da tabela de tarefas",
                tags: [{ label: "P2", tone: "warning" }],
                assigneeInitials: "VM",
            },
            {
                id: "backlog-3",
                title: "Adicionar autenticação por SSO",
                tags: [{ label: "P3", tone: "neutral" }],
                assigneeInitials: "AL",
            },
            {
                id: "backlog-4",
                title: "Escrever testes de integração do Kanban",
                tags: [{ label: "P2", tone: "warning" }],
                assigneeInitials: "JP",
            },
        ],
    },
    {
        id: "todo",
        label: "A Fazer",
        cards: [
            {
                id: "todo-1",
                title: "Implementar filtro por prioridade no board",
                tags: [{ label: "P1", tone: "danger" }],
                assigneeInitials: "AL",
            },
            {
                id: "todo-2",
                title: "Adicionar webhook de merge do GitLab",
                tags: [{ label: "P2", tone: "warning" }],
                assigneeInitials: "JP",
            },
            {
                id: "todo-3",
                title: "Criar tela de subtarefas no detalhe da task",
                tags: [{ label: "P2", tone: "warning" }],
                assigneeInitials: "GT",
            },
        ],
    },
    {
        id: "in-progress",
        label: "Em Andamento",
        cards: [
            {
                id: "in-progress-1",
                title: "Refatorar serviço de priorização por IA",
                tags: [
                    { label: "P1", tone: "danger" },
                    { label: "sugerida priorização", tone: "ai" },
                ],
                assigneeInitials: "VM",
            },
            {
                id: "in-progress-2",
                title: "Sincronizar status via webhook do GitHub",
                tags: [{ label: "P2", tone: "warning" }],
                assigneeInitials: "RC",
            },
            {
                id: "in-progress-3",
                title: "Ajustar cálculo de carga por time",
                tags: [{ label: "P3", tone: "neutral" }],
                assigneeInitials: "VM",
            },
        ],
    },
    {
        id: "in-review",
        label: "Em Revisão",
        cards: [
            {
                id: "in-review-1",
                title: "Endpoint de convite de usuários",
                tags: [
                    { label: "PR #48", tone: "info" },
                    { label: "em revisão", tone: "warning" },
                ],
                assigneeInitials: "RC",
            },
            {
                id: "in-review-2",
                title: "Migração do schema de Tarefas",
                tags: [
                    { label: "PR #52", tone: "info" },
                    { label: "em revisão", tone: "warning" },
                ],
                assigneeInitials: "GT",
            },
        ],
    },
    {
        id: "done",
        label: "Concluído",
        cards: [
            {
                id: "done-1",
                title: "Tela de login e autenticação JWT",
                tags: [
                    { label: "Feito", tone: "success" },
                    { label: "merged", tone: "success" },
                ],
                assigneeInitials: "AL",
            },
            {
                id: "done-2",
                title: "Modelo de dados de Times e Membros",
                tags: [
                    { label: "Feito", tone: "success" },
                    { label: "merged", tone: "success" },
                ],
                assigneeInitials: "VM",
            },
            {
                id: "done-3",
                title: "Configurar CI/CD do backend",
                tags: [
                    { label: "Feito", tone: "success" },
                    { label: "merged", tone: "success" },
                ],
                assigneeInitials: "RC",
            },
            {
                id: "done-4",
                title: "Implementar hierarquia de times",
                tags: [
                    { label: "Feito", tone: "success" },
                    { label: "merged", tone: "success" },
                ],
                assigneeInitials: "JP",
            },
            {
                id: "done-5",
                title: "Layout base do Dashboard",
                tags: [
                    { label: "Feito", tone: "success" },
                    { label: "merged", tone: "success" },
                ],
                assigneeInitials: "AL",
            },
        ],
    },
];
