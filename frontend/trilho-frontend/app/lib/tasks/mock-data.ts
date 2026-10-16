import type { Task } from "./types";

// TODO: substituir por dados reais da API (tarefas, subtarefas, comentários e vínculo Git).

/**
 * "Hoje" fixo do mock, pra que atraso e prazos não envelheçam com o relógio.
 * Na integração, trocar por `new Date()` / data do servidor.
 */
export const MOCK_TODAY = "2026-08-28";

type TaskSeed = Pick<Task, "number" | "title" | "status" | "priority" | "assigneeId"> &
    Partial<Task>;

function makeTask(seed: TaskSeed): Task {
    return {
        id: `task-${seed.number}`,
        description: "",
        teamId: "backend",
        createdById: "ana-luiza",
        createdAt: "2026-08-10",
        subtasks: [],
        comments: [],
        ...seed,
    };
}

export const TASKS: Task[] = [
    // Backlog
    makeTask({
        number: 119,
        title: "Criar endpoint de exportação de relatórios",
        description: "Exportar o consolidado de tarefas por time em CSV e PDF.",
        status: "backlog",
        priority: "low",
        assigneeId: "raphael-carneiro",
        dueDate: "2026-09-30",
    }),
    makeTask({
        number: 120,
        title: "Revisar índices da tabela de tarefas",
        description: "Analisar planos de execução das consultas do board e criar índices faltantes.",
        status: "backlog",
        priority: "medium",
        assigneeId: "vitor-medina",
        dueDate: "2026-09-15",
    }),
    makeTask({
        number: 121,
        title: "Adicionar autenticação por SSO",
        status: "backlog",
        priority: "low",
        assigneeId: "ana-luiza",
        dueDate: "2026-10-15",
    }),
    makeTask({
        number: 122,
        title: "Escrever testes de integração do Kanban",
        status: "backlog",
        priority: "medium",
        assigneeId: "joao-pedro",
        dueDate: "2026-09-20",
    }),

    // A Fazer
    makeTask({
        number: 123,
        title: "Implementar filtro por prioridade no board",
        description: "Permitir filtrar os cards do quadro por prioridade e por responsável.",
        status: "todo",
        priority: "high",
        assigneeId: "ana-luiza",
        dueDate: "2026-09-05",
    }),
    makeTask({
        number: 124,
        title: "Adicionar webhook de merge do GitLab",
        status: "todo",
        priority: "medium",
        assigneeId: "joao-pedro",
        dueDate: "2026-09-10",
    }),
    makeTask({
        number: 125,
        title: "Criar tela de subtarefas no detalhe da task",
        status: "todo",
        priority: "medium",
        teamId: "frontend",
        assigneeId: "giovanna-tamos",
        dueDate: "2026-08-30",
    }),
    makeTask({
        number: 129,
        title: "Corrigir falha de autenticação em produção",
        description:
            "Usuários ativos recebem 401 intermitente ao renovar o token. Impacto em clientes em produção.",
        status: "todo",
        priority: "urgent",
        assigneeId: "ana-luiza",
        createdAt: "2026-08-27",
        dueDate: "2026-08-29",
    }),

    // Em Andamento
    makeTask({
        number: 128,
        title: "Refatorar serviço de priorização por IA",
        description:
            "Extrair a lógica de cálculo de prioridade para um serviço isolado (SRP), permitindo plugar novos critérios (carga, prazo, histórico) sem alterar o controller. Cobrir com testes unitários (xUnit).",
        status: "in-progress",
        priority: "high",
        assigneeId: "vitor-medina",
        createdAt: "2026-08-12",
        dueDate: "2026-09-02",
        subtasks: [
            {
                id: "sub-1",
                title: "Extrair interface IPriorityCalculator",
                done: true,
                assigneeId: "vitor-medina",
            },
            {
                id: "sub-2",
                title: "Migrar cálculo de carga por time",
                done: true,
                assigneeId: "vitor-medina",
            },
            {
                id: "sub-3",
                title: "Adicionar testes unitários (xUnit)",
                done: false,
                assigneeId: "raphael-carneiro",
            },
            {
                id: "sub-4",
                title: "Atualizar documentação do serviço",
                done: false,
                assigneeId: "vitor-medina",
            },
        ],
        comments: [
            {
                id: "com-1",
                authorId: "ana-luiza",
                body: "Consegue priorizar os testes antes do fim da sprint? O QA depende disso.",
            },
            {
                id: "com-2",
                authorId: "vitor-medina",
                body: "Consigo sim, já abri o PR de extração da interface. Termino os testes até amanhã.",
            },
        ],
        git: {
            branch: "feat/ia-priorizacao",
            pullRequest: { number: 52, state: "open" },
            lastCommit: "há 3 horas",
        },
        aiSuggestion: {
            priority: "high",
            justification:
                "Vitor tem a menor carga do time Backend (3 tarefas abertas) e o prazo está a 5 dias.",
        },
    }),
    makeTask({
        number: 126,
        title: "Sincronizar status via webhook do GitHub",
        status: "in-progress",
        priority: "medium",
        assigneeId: "raphael-carneiro",
        dueDate: "2026-08-25",
        git: { branch: "feat/webhook-github", lastCommit: "há 1 dia" },
    }),
    makeTask({
        number: 127,
        title: "Ajustar cálculo de carga por time",
        status: "in-progress",
        priority: "low",
        assigneeId: "vitor-medina",
        dueDate: "2026-09-12",
    }),

    // Em Revisão
    makeTask({
        number: 118,
        title: "Endpoint de convite de usuários",
        status: "in-review",
        priority: "medium",
        assigneeId: "raphael-carneiro",
        dueDate: "2026-08-29",
        git: {
            branch: "feat/convite-usuarios",
            pullRequest: { number: 48, state: "open" },
            lastCommit: "há 5 horas",
        },
    }),
    makeTask({
        number: 117,
        title: "Migração do schema de Tarefas",
        status: "in-review",
        priority: "medium",
        teamId: "dados",
        assigneeId: "giovanna-tamos",
        dueDate: "2026-09-01",
        git: {
            branch: "chore/schema-tarefas",
            pullRequest: { number: 50, state: "open" },
            lastCommit: "há 2 dias",
        },
    }),

    // Concluído
    makeTask({
        number: 110,
        title: "Tela de login e autenticação JWT",
        status: "done",
        priority: "high",
        assigneeId: "ana-luiza",
        dueDate: "2026-08-20",
        git: {
            branch: "feat/login-jwt",
            pullRequest: { number: 41, state: "merged" },
            lastCommit: "há 6 dias",
        },
    }),
    makeTask({
        number: 111,
        title: "Modelo de dados de Times e Membros",
        status: "done",
        priority: "medium",
        assigneeId: "vitor-medina",
        dueDate: "2026-08-18",
        git: {
            branch: "feat/modelo-times",
            pullRequest: { number: 43, state: "merged" },
            lastCommit: "há 8 dias",
        },
    }),
    makeTask({
        number: 112,
        title: "Configurar CI/CD do backend",
        status: "done",
        priority: "medium",
        assigneeId: "raphael-carneiro",
        dueDate: "2026-08-15",
        git: {
            branch: "chore/ci-cd",
            pullRequest: { number: 44, state: "merged" },
            lastCommit: "há 12 dias",
        },
    }),
    makeTask({
        number: 113,
        title: "Implementar hierarquia de times",
        status: "done",
        priority: "high",
        assigneeId: "joao-pedro",
        dueDate: "2026-08-22",
        git: {
            branch: "feat/hierarquia-times",
            pullRequest: { number: 46, state: "merged" },
            lastCommit: "há 5 dias",
        },
    }),
    makeTask({
        number: 114,
        title: "Layout base do Dashboard",
        status: "done",
        priority: "low",
        teamId: "frontend",
        assigneeId: "ana-luiza",
        dueDate: "2026-08-24",
        git: {
            branch: "feat/layout-dashboard",
            pullRequest: { number: 47, state: "merged" },
            lastCommit: "há 4 dias",
        },
    }),
];
