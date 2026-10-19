# Trilho — Frontend

Interface web do Trilho (gestão inteligente de times e projetos de desenvolvimento).
Next.js 16 (App Router) · React 19 · Tailwind 4 · zod · dnd-kit.

> Esta versão do Next tem mudanças em relação ao que a maioria dos materiais descreve.
> Consulte `node_modules/next/dist/docs/` antes de usar uma API (ver `AGENTS.md`).

## Rodando

```bash
npm install
cp .env.example .env.local   # ajuste API_URL
npm run dev                  # http://localhost:3000
npm run lint && npx tsc --noEmit && npm run build
```

### Modos de execução

| Modo | Quando | Comportamento |
|---|---|---|
| **Real** | `API_URL` definida (ex: `http://localhost:5018`) | Todas as telas falam com o backend .NET (auth, usuários, times, tarefas, convites, dashboard, notificações, IA, Git). |
| **Demonstração** | sem `API_URL`, ou `USE_MOCK_API=true` | Login e dados simulados, sem backend. Entre com `camila.duarte@exemplo.com` e qualquer senha. Criar/alterar é só visual (não persiste). **Ignorado em produção.** |

Para o modo real, suba a API (`backend/API`, ver o README de lá), defina `API_URL` no `.env.local`
e entre com o administrador criado pelo seed (`Settings:SeedAdmin`).

## Arquitetura

```
app/
  (home)/              landing page (pública)
  (app)/               área autenticada — layout com sidebar, sessão verificada no servidor
    dashboard/ kanban/ times/ tarefas/ integracoes-git/ configuracoes/
  login/ activate-account/ reset-password/   fluxos de autenticação (públicos)
  components/          primitivos compartilhados (Button, Input, Modal, Card, Badge...)
  lib/
    api/               cliente HTTP do backend (server-only), DTOs e mapeadores
    session/           cookie httpOnly com o JWT, leitura do token e DAL
    validation/        base do zod (+ hook de formulário)
    tasks/ teams/ git-integrations/ ai-suggestions/   domínio + mocks + funções de consulta
proxy.ts               guard otimista de rotas (cookie presente e não expirado)
```

Convenções:

- **Colocalização**: componentes e schemas usados por uma rota ficam na pasta dela
  (`app/login/login-form`, `app/(app)/kanban/new-task-modal/schema.ts`). Só o que é
  reutilizado entre rotas vai para `app/components`.
- **Um schema zod por formulário** (`schema.ts`), em pt-BR, com as regras de senha vindas de
  `app/lib/password-rules.ts` (espelham o `PasswordValidator` do backend).
- **Cliente nunca fala com o backend**: o backend não habilita CORS e o JWT fica em cookie
  `httpOnly`. Toda chamada passa por Server Components / Server Actions (`app/lib/api`).

## Autenticação

1. `app/login/actions.ts` valida com zod, chama `POST /api/Auth` e grava o JWT em cookie httpOnly.
2. `proxy.ts` faz só a checagem otimista (cookie existe e não expirou).
3. `app/lib/session/dal.ts` (`verifySession`, `getCurrentUser`) verifica de verdade, no servidor,
   e o `(app)/layout.tsx` entrega o usuário aos componentes de cliente via contexto.

## Camada de API

Tudo roda no servidor (`app/lib/api`, marcado com `server-only`):

| Arquivo | Endpoints |
|---|---|
| `auth.ts`, `users.ts` | `/api/Auth`, `/api/Auth/me`, `/api/User` (pagina via `X-Total-Count`) |
| `teams.ts` | `/api/Team` (inclui carga de trabalho calculada pelo backend) |
| `tasks.ts`, `prioritization.ts` | `/api/Task` (board, detalhe, mover, subtarefas, comentários, histórico), `/api/Prioritization` |
| `invites.ts`, `password-reset.ts` | `/api/Invite`, `/api/PasswordReset` |
| `dashboard.ts`, `notifications.ts`, `git.ts` | `/api/Dashboard`, `/api/Notification`, `/api/GitRepository` |

- Os DTOs (`dtos.ts`) espelham `Trilho.Communication`; os mapeadores (`mappers.ts`) convertem para os
  tipos de domínio das telas (ids numéricos viram `string`, perfis `administrador/lider/user` viram
  `admin/leader/member`).
- Escritas são **Server Actions** (`actions.ts` ao lado de cada rota): validam com zod, chamam a API e
  devolvem `{ ok, message }`; os componentes de cliente fazem atualização otimista e desfazem se o
  servidor recusar (ex: concluir tarefa com subtarefas pendentes). **A regra de permissão é sempre a do
  backend** — esconder botões na tela é só ergonomia.
- O sino de notificações (`components/notifications`) fica no layout autenticado e atualiza a cada minuto.
- A redefinição de senha guarda o e-mail/código entre os 3 passos num cookie httpOnly de 15 min
  restrito a `/reset-password`.

### Convenção para ligar o Git às tarefas

Cite `#123`, `task-123` ou `trilho-123` na branch, no título/descrição do PR ou no commit: o webhook
move a tarefa (PR aberto → Em Revisão, merge → Concluído) e registra no histórico.

## Testes

```bash
npm test          # Vitest (unitários: mappers, schemas, regras de senha, filtros do Kanban, mensagens de erro)
npm run test:watch
npm run test:e2e  # Playwright (Chromium) em modo demonstração: login, arrastar com mouse, filtros, perfis, responsivo e acessibilidade (axe, WCAG 2.1 AA)
```

Na primeira vez: `npx playwright install chromium`.

O CI (`.github/workflows/frontend-ci.yml`) roda lint, `tsc`, testes, build e `npm audit --omit=dev`.
