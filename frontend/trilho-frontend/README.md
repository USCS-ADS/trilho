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
| **Real** | `API_URL` definida (ex: `http://localhost:5018`) | Login e usuários vão ao backend .NET. |
| **Demonstração** | sem `API_URL`, ou `USE_MOCK_API=true` | Login e dados simulados, sem backend. Entre com `camila.duarte@exemplo.com` e qualquer senha. **Ignorado em produção.** |

Times, tarefas, integrações Git e IA ainda **não têm endpoint** no backend: essas telas
usam dados mockados em ambos os modos (ver "Costuras para a API").

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

## Costuras para a API

Cada domínio expõe funções de consulta (`listTasks()`, `getTaskById()`, `listTeams()`,
`listRepositories()`...) sobre dados mockados. Ao integrar, troque a implementação por chamadas
em `app/lib/api` — as telas não mudam. Ver os `// TODO` nos pontos de escrita.

## Lacunas conhecidas do backend (impactam o frontend)

- Sem endpoints de **times, tarefas, subtarefas, comentários, Git e IA**.
- Sem **convite por e-mail / ativação de conta / redefinição de senha** (RF01).
- Perfis só **`administrador`** e **`user`**; "Líder de Time" não existe como perfil.
- Nenhum endpoint exige **`[Authorize]`** nem há validação do JWT; **sem CORS**.
- Senha exige também **minúscula** e especial em `! ? * . & $ # @` (mais estrito que o RF01).
