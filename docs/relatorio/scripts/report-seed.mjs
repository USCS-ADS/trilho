// Carrega dados da "Nexus Advanced Analytics" num banco DESCARTÁVEL, só pela API pública (como um usuário real faria),
// para as capturas de tela do relatório. Uso: node report-seed.mjs  (API em http://localhost:5018, admin já semeado).
import crypto from "node:crypto";

const API = process.env.API_URL ?? "http://localhost:5018";
const PASSWORD = process.env.REPORT_PASSWORD ?? "Nexus@2026";
const ADMIN_EMAIL = "camila.duarte@nexusanalytics.example";

async function call(method, path, token, body, headers = {}) {
    const response = await fetch(`${API}${path}`, {
        method,
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
        body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`${method} ${path} -> ${response.status} ${text}`);
    return text ? JSON.parse(text) : null;
}

const login = async (email) => (await call("POST", "/api/Auth", null, { email, password: PASSWORD })).token;

const today = new Date();
const day = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
};

// ---------------------------------------------------------------- pessoas
const people = [
    { key: "camila", name: "Camila Duarte", role: "administrador", admin: true },
    { key: "ana", name: "Ana Luiza Lourenço", role: "lider" },
    { key: "raphael", name: "Raphael Carneiro", role: "lider" },
    { key: "giovanna", name: "Giovanna Tamos", role: "lider" },
    { key: "arthur", name: "Arthur Rodrigues", role: "lider" },
    { key: "vitor", name: "Vitor Medina", role: "user" },
    { key: "joao", name: "João Pedro Alves", role: "user" },
    { key: "felipe", name: "Felipe Nunes", role: "user" },
    { key: "marina", name: "Marina Costa", role: "user" },
    { key: "beatriz", name: "Beatriz Souza", role: "user" },
    { key: "lucas", name: "Lucas Prado", role: "user" },
];
const emailOf = (p) => (p.admin ? ADMIN_EMAIL : `${p.name.split(" ")[0].normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()}.${p.name.split(" ").at(-1).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()}@nexusanalytics.example`);

const adminToken = await login(ADMIN_EMAIL);
const user = {};

for (const person of people) {
    if (person.admin) {
        user[person.key] = { ...person, email: ADMIN_EMAIL, token: adminToken, id: (await call("GET", "/api/Auth/me", adminToken)).id };
        continue;
    }
    const email = emailOf(person);
    const created = await call("POST", "/api/User", adminToken, { name: person.name, email, password: PASSWORD, role: person.role });
    user[person.key] = { ...person, email, id: created.id, token: await login(email) };
}

// ---------------------------------------------------------------- times
const teamsSpec = [
    { key: "backend", name: "Backend", description: "APIs, banco de dados e integrações do Trilho.", leader: "ana", members: ["vitor", "joao", "felipe"] },
    { key: "frontend", name: "Frontend", description: "Interface web, design system e experiência do usuário.", leader: "raphael", members: ["marina", "joao", "vitor"] },
    { key: "dados", name: "Dados", description: "Pipelines, qualidade e modelagem analítica.", leader: "giovanna", members: ["beatriz", "raphael"] },
    { key: "ml", name: "Machine Learning", description: "Modelos preditivos e priorização assistida.", leader: "arthur", members: ["lucas", "vitor"] },
];
const team = {};

for (const spec of teamsSpec) {
    const created = await call("POST", "/api/Team", adminToken, { name: spec.name, description: spec.description, leaderId: user[spec.leader].id });
    team[spec.key] = { ...spec, id: created.id };
    for (const member of spec.members) {
        await call("POST", `/api/Team/${created.id}/member`, adminToken, { userId: user[member].id });
    }
}

// ---------------------------------------------------------------- tarefas
const tasksSpec = [
    // Backend
    { team: "backend", title: "Criar endpoint de exportação de relatórios", status: "backlog", priority: "low", description: "Exportar o consolidado de tarefas por time em CSV e PDF." },
    { team: "backend", title: "Revisar índices da tabela de tarefas", status: "todo", priority: "high", assignee: "vitor", due: 5, description: "Avaliar consultas lentas do quadro Kanban e criar índices compostos." },
    { team: "backend", title: "Adicionar autenticação por SSO", status: "todo", priority: "medium", assignee: "felipe", due: 21, description: "Permitir login corporativo via OpenID Connect." },
    { team: "backend", key: "refactor", title: "Refatorar serviço de priorização por IA", status: "in-progress", priority: "high", assignee: "ana", due: 3, description: "Separar o cálculo de prioridade do cálculo de carga de trabalho (SRP).", subtasks: [["Extrair interface IPrioritizationEngine", true], ["Migrar cálculo de carga por time", true], ["Adicionar testes unitários (xUnit)", false]] },
    { team: "backend", key: "authbug", title: "Corrigir falha de autenticação em produção", status: "in-progress", priority: "urgent", assignee: "joao", due: -2, description: "Tokens expirados não estavam levando o usuário ao login.", comments: [["ana", "Prazo estourou: precisamos priorizar essa correção ainda hoje."], ["joao", "Reproduzi o erro; subo a correção em seguida."]] },
    { team: "backend", key: "gitlab", title: "Adicionar webhook de merge do GitLab", status: "todo", priority: "medium", assignee: "vitor", due: 1, description: "Tratar o evento de merge request do GitLab e atualizar o status da tarefa.", pr: { number: 52, repo: "backend", open: true } },
    { team: "backend", key: "ci", title: "Configurar pipeline de integração contínua", status: "todo", priority: "medium", assignee: "felipe", due: -6, description: "Rodar build e testes a cada pull request.", pr: { number: 47, repo: "backend", open: true, merge: true }, subtasks: [["Workflow do backend", true], ["Workflow do frontend", true]] },
    { team: "backend", title: "Documentar a API com Swagger", status: "done", priority: "low", assignee: "vitor", description: "Descrição dos endpoints, exemplos e códigos de erro." },
    // Frontend
    { team: "frontend", title: "Criar tela de subtarefas no detalhe da tarefa", status: "backlog", priority: "medium", description: "Lista com progresso e criação rápida de subtarefas." },
    { team: "frontend", title: "Implementar filtro por prioridade no quadro", status: "todo", priority: "medium", assignee: "marina", due: 7, description: "Busca por título e filtros por responsável e prioridade." },
    { team: "frontend", title: "Escrever testes de interface do Kanban", status: "in-progress", priority: "high", assignee: "joao", due: 2, description: "Cobrir arrastar e soltar, rollback e filtros.", subtasks: [["Arrastar entre colunas", true], ["Recusa do servidor", false]] },
    { team: "frontend", key: "mobile", title: "Ajustar o layout para celulares", status: "todo", priority: "high", assignee: "raphael", due: 4, description: "Revisar o cabeçalho e as tabelas em telas de 375px.", pr: { number: 61, repo: "frontend", open: true } },
    { team: "frontend", title: "Criar tela de redefinição de senha em 3 etapas", status: "done", priority: "medium", assignee: "marina", description: "E-mail, código de 6 dígitos e nova senha." },
    // Dados
    { team: "dados", title: "Modelar a tabela de histórico de tarefas", status: "in-progress", priority: "high", assignee: "beatriz", due: 6, description: "Base para o cálculo de tempo médio de conclusão." },
    { team: "dados", title: "Criar relatório de carga de trabalho por sprint", status: "todo", priority: "medium", assignee: "giovanna", due: 10, description: "Consolidado semanal para a diretoria de engenharia." },
    { team: "dados", title: "Validar a qualidade dos dados de entrada", status: "backlog", priority: "low", description: "Regras de consistência para prazos e responsáveis." },
    { team: "dados", title: "Publicar dicionário de dados", status: "done", priority: "low", assignee: "beatriz", description: "Documentar tabelas e campos do banco." },
    // Machine Learning
    { team: "ml", title: "Treinar modelo de estimativa de esforço", status: "backlog", priority: "medium", description: "Estimar duração com base no histórico de tarefas semelhantes." },
    { team: "ml", title: "Avaliar métricas do ranking de prioridades", status: "in-progress", priority: "high", assignee: "lucas", due: 8, description: "Comparar a ordem sugerida com a decidida pela liderança." },
    { team: "ml", title: "Preparar conjunto de dados de treino", status: "todo", priority: "medium", assignee: "vitor", due: 12, description: "Limpeza e anonimização do histórico." },
];

const created = {};

for (const spec of tasksSpec) {
    const lead = user[team[spec.team].leader];
    const task = await call("POST", "/api/Task", lead.token, {
        title: spec.title,
        description: spec.description ?? "",
        teamId: team[spec.team].id,
        assigneeId: spec.assignee ? user[spec.assignee].id : null,
        dueDate: spec.due === undefined ? null : day(spec.due),
        priority: spec.priority,
        status: spec.status,
    });
    created[spec.key ?? spec.title] = { ...spec, id: task.id };

    for (const [title, done] of spec.subtasks ?? []) {
        const sub = await call("POST", `/api/Task/${task.id}/subtask`, lead.token, { title });
        if (done) await call("PUT", `/api/Task/${task.id}/subtask/${sub.id}`, lead.token, { title, isDone: true, assigneeId: null });
    }
    for (const [who, body] of spec.comments ?? []) {
        await call("POST", `/api/Task/${task.id}/comment`, user[who].token, { body });
    }
}

// ---------------------------------------------------------------- Git: repositórios + webhooks assinados (HMAC)
const repos = {};
for (const [key, fullName] of [["backend", "nexus-analytics/trilho-backend"], ["frontend", "nexus-analytics/trilho-frontend"]]) {
    repos[key] = await call("POST", "/api/GitRepository", adminToken, { provider: "github", fullName, teamId: team[key].id });
}

async function webhook(repoKey, event, payload) {
    const repo = repos[repoKey];
    const body = JSON.stringify(payload);
    const signature = "sha256=" + crypto.createHmac("sha256", repo.webhookSecret).update(body).digest("hex");
    const response = await fetch(`${API}/api/GitWebhook/${repo.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-GitHub-Event": event, "X-Hub-Signature-256": signature },
        body,
    });
    if (!response.ok && response.status !== 202 && response.status !== 204) throw new Error(`webhook ${event} -> ${response.status} ${await response.text()}`);
}

for (const task of Object.values(created)) {
    if (!task.pr) continue;
    const branch = `feature/task-${task.id}-${task.title.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-").slice(0, 28).replace(/-$/, "")}`;
    const now = new Date().toISOString();

    await webhook(task.pr.repo, "push", {
        ref: `refs/heads/${branch}`,
        commits: [{ message: `feat: avança a tarefa #${task.id}`, timestamp: now }],
    });
    await webhook(task.pr.repo, "pull_request", {
        action: "opened",
        pull_request: { number: task.pr.number, title: `#${task.id} ${task.title}`, body: "", head: { ref: branch }, merged: false, updated_at: now },
    });
    if (task.pr.merge) {
        await webhook(task.pr.repo, "pull_request", {
            action: "closed",
            pull_request: { number: task.pr.number, title: `#${task.id} ${task.title}`, body: "", head: { ref: branch }, merged: true, merged_at: now },
        });
    }
}

// ---------------------------------------------------------------- convite pendente
await call("POST", "/api/Invite", adminToken, { email: "carolina.mendes@nexusanalytics.example", fullName: "Carolina Mendes", teamId: team.frontend.id, role: "user" });

console.log(JSON.stringify({ users: Object.fromEntries(Object.entries(user).map(([k, v]) => [k, v.email])), teams: Object.fromEntries(Object.entries(team).map(([k, v]) => [k, v.id])), tasks: Object.fromEntries(Object.entries(created).map(([k, v]) => [k, v.id])), repos: Object.fromEntries(Object.entries(repos).map(([k, v]) => [k, v.id])) }, null, 1));
