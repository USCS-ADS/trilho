# Trilho

Plataforma web de **gestão inteligente de times e projetos de desenvolvimento**, criada no Projeto de Extensão / PIM do curso de Análise e Desenvolvimento de Sistemas da USCS,
para a empresa fictícia Nexus Advanced Analytics.

O que o sistema faz:

- três perfis de acesso (membro, líder de time e administrador), com acesso só por convite;
- times, tarefas e subtarefas, comentários e histórico de cada tarefa;
- quadro **Kanban** por time (arrastar e soltar), com filtros;
- **priorização assistida**: sugere prioridade e responsável a partir do prazo e da carga de trabalho, com justificativa;
- **integração com GitHub e GitLab**: o pull request aberto leva a tarefa para "Em Revisão" e o merge para "Concluído" (webhooks assinados);
- dashboard consolidado, notificações de prazo, redefinição de senha e painel administrativo.

## Estrutura

| Pasta | O que é |
|---|---|
| [`backend/API`](backend/API) | API REST em **.NET 8** (Clean Architecture, SOLID), Entity Framework Core e MySQL. Testes com xUnit. Detalhes em [`backend/API/README.md`](backend/API/README.md). |
| [`frontend/trilho-frontend`](frontend/trilho-frontend) | Interface em **Next.js 16**, React 19 e Tailwind. Testes com Vitest e Playwright. Detalhes em [`frontend/trilho-frontend/README.md`](frontend/trilho-frontend/README.md). |

## Como rodar na sua máquina

**Pré-requisitos:** [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0), [Node.js](https://nodejs.org/) 20 ou mais novo e Docker (para o MySQL) ou um MySQL 8 já instalado.

**1. Banco de dados (MySQL 8)**

```bash
cd backend/API
docker compose up -d
```

Sobe o MySQL em `localhost:3306`, com o banco `trilhodb` e a senha do `root` `trilho_dev_password` (padrão do `docker-compose.yml`).

**2. API (porta 5018)**

```bash
cd backend/API/src/Trilho.Api
cp appsettings.Local.example.json appsettings.Local.json
```

Abra o `appsettings.Local.json` (o Git ignora este arquivo) e ajuste: na connection string, `Pwd=trilho_dev_password` (se usou o Docker acima); uma `SigningKey` do JWT com 32 caracteres ou mais; e o e-mail e a senha do administrador inicial (`SeedAdmin`). Depois:

```bash
dotnet run
```

As migrations rodam e o administrador é criado na inicialização. Swagger: <http://localhost:5018/swagger>.
Em desenvolvimento o e-mail não é enviado: o link do convite e o código de redefinição de senha aparecem no log da API.

**3. Frontend (porta 3000)**

```bash
cd frontend/trilho-frontend
cp .env.example .env.local      # já aponta para API_URL=http://localhost:5018
npm install
npm run dev
```

Abra <http://localhost:3000> e entre com o e-mail e a senha do administrador que você definiu no passo 2.
Sem a API no ar (sem `API_URL`), o frontend roda em **modo demonstração**, com dados simulados (veja o README do frontend).

## Testes

```bash
# backend (86 de casos de uso + 167 de integração)
cd backend/API && dotnet test Trilho.sln

# frontend (unitários e de ponta a ponta)
cd frontend/trilho-frontend
npm test
npx playwright install chromium   # só na primeira vez
npm run test:e2e
```
