/**
 * Conteúdo ilustrativo do print de produto exibido na landing page — não é
 * dado real de nenhum usuário, só uma amostra representativa do quadro Kanban.
 */

export type CardTagTone = "priority" | "info" | "success" | "ai";

export interface KanbanCard {
    title: string;
    tag: { label: string; tone: CardTagTone };
    assigneeInitials?: string;
}

export interface KanbanColumn {
    label: string;
    count: number;
    cards: KanbanCard[];
}

export const SIDEBAR_NAV_ITEMS = [
    { label: "Dashboard", active: true },
    { label: "Kanban", active: false },
    { label: "Times", active: false },
    { label: "Integrações Git", active: false },
];

export const KANBAN_COLUMNS: KanbanColumn[] = [
    {
        label: "A FAZER",
        count: 3,
        cards: [
            {
                title: "Implementar filtro por prioridade",
                tag: { label: "P1", tone: "priority" },
                assigneeInitials: "AL",
            },
            {
                title: "Adicionar webhook de merge",
                tag: { label: "P2", tone: "priority" },
                assigneeInitials: "JP",
            },
        ],
    },
    {
        label: "EM ANDAMENTO",
        count: 2,
        cards: [
            {
                title: "Refatorar serviço de priorização por IA",
                tag: { label: "sugerido pela IA", tone: "ai" },
                assigneeInitials: "VM",
            },
        ],
    },
    {
        label: "EM REVISÃO",
        count: 1,
        cards: [
            {
                title: "Endpoint de convite de usuários",
                tag: { label: "PR #68", tone: "info" },
                assigneeInitials: "RC",
            },
        ],
    },
    {
        label: "CONCLUÍDO",
        count: 4,
        cards: [
            {
                title: "Tela de login e autenticação JWT",
                tag: { label: "Feito", tone: "success" },
                assigneeInitials: "AL",
            },
        ],
    },
];
