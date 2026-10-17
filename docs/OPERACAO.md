# Trilho — guia de operação

Para quem vai colocar o Trilho no ar e mantê-lo funcionando. As chaves de configuração do backend estão detalhadas em
[`backend/API/README.md`](../backend/API/README.md#configuração); aqui está o roteiro e o que conferir.

## Visão geral

| Peça | Tecnologia | Porta padrão | Observação |
|---|---|---|---|
| Banco | MySQL 8 | 3306 | migrations aplicadas pela API ao iniciar |
| API | .NET 8 (`Trilho.Api`) | 5018 (dev) | liveness `/health`, readiness `/health/ready` (checa o banco) |
| Front | Next.js 16 (`trilho-frontend`) | 3000 | conversa com a API **só pelo servidor**; o navegador nunca vê o token |

O navegador fala apenas com o front. O front chama a API por `API_URL` (rede interna é suficiente).

## Checklist de produção

**Segredos (nunca no repositório — variáveis de ambiente, cofre ou user-secrets):**

- [ ] `ConnectionStrings__Connection` — usuário próprio do banco (não `root`).
- [ ] `Settings__Jwt__SigningKey` — aleatória, ≥ 32 caracteres. Trocar a chave derruba todas as sessões.
- [ ] `Settings__SeedAdmin__{Name,Email,Password}` — administrador inicial; troque a senha depois do primeiro acesso.
- [ ] `Settings__Email__Smtp__Password` (se usar SMTP real).

**Rede e URLs:**

- [ ] HTTPS terminado em um proxy reverso (nginx, Caddy, balanceador). Com proxy, `Settings__UseForwardedHeaders=true` para a API
      enxergar IP e esquema reais (necessário para o rate limit por IP e para o HSTS).
- [ ] `Settings__AllowedOrigins__0` — a origem pública do front (CORS).
- [ ] `Settings__FrontendBaseUrl` — base dos links enviados por e-mail (ativação de conta).
- [ ] `Settings__PublicApiBaseUrl` — URL pública da API; é a base do webhook mostrado ao conectar um repositório Git.
- [ ] Front: `API_URL` apontando para a API e `NODE_ENV=production` (o modo demonstração é ignorado em produção; sem `API_URL`
      as chamadas falham em vez de simular login). O cookie de sessão só é marcado `Secure` em produção — exige HTTPS.

**Dados que precisam sobreviver a reinícios:**

- [ ] `Settings__DataProtectionKeysPath` num volume persistente. As chaves cifram os segredos de webhook; sem isso, após reiniciar
      os segredos ficam ilegíveis e é preciso reconectar os repositórios.
- [ ] Volume do MySQL.

**E-mail:**

- [ ] `Settings__Email__Provider=Smtp` e `Settings__Email__Smtp__*`. Com `Log` (padrão) nenhum e-mail sai: convite e
      "esqueci a senha" só aparecem no log.

**Desligue em produção:** `Settings__SeedDemo__Enabled` (dados fictícios) e `Settings__Email__LogBody`.

## Subir com Docker

```bash
cd backend/API
cp .env.example .env      # preencha os valores
docker compose --profile full up -d --build
```

O `Dockerfile` e o compose estão descritos no README do backend. (Ainda não foram validados num daemon real — veja
"Pendências conhecidas".)

## Ajustes de segurança embutidos

- Login: rate limit por IP e **bloqueio da conta** após 5 senhas erradas seguidas por 15 min
  (`Settings__Login__MaxFailedAttempts`, `LockoutMinutes`). Redefinir a senha destrava.
- JWT válido por 8 h (`Settings__Jwt__ExpiresMinutes`), sem refresh token; conta desativada perde o acesso na hora.
- Código de redefinição de senha: 15 min, 5 tentativas, uso único.
- Cabeçalhos de segurança, HSTS e redirecionamento HTTPS na API; webhooks com assinatura verificada.

## Backup e restauração (MySQL)

Backup lógico diário (ajuste usuário/host):

```bash
mysqldump --single-transaction --routines --default-character-set=utf8mb4 -h <host> -u <usuario> -p trilho > trilho-$(date +%F).sql
```

Restauração em um banco vazio:

```bash
mysql -h <host> -u <usuario> -p -e "CREATE DATABASE trilho CHARACTER SET utf8mb4"
mysql -h <host> -u <usuario> -p trilho < trilho-2026-10-17.sql
```

Guarde também a pasta de `DataProtectionKeysPath` e as variáveis de ambiente (sem elas os segredos de webhook e as sessões
não são recuperáveis). Teste a restauração periodicamente, não só o backup.

## Monitoramento

- Liveness: `GET /health` (200 = processo vivo). Readiness: `GET /health/ready` (200 só se o banco responde).
- Todo pedido carrega um `X-Correlation-Id`; as mensagens de erro de log trazem o mesmo id para rastrear um problema relatado.
- Alerte em: readiness fora do ar, aumento de respostas 5xx/429, e-mails falhando (log do SMTP), fila de eventos Git com
  tentativas esgotadas.
- Jobs em segundo plano (aviso de prazo, reprocessamento de eventos Git, retenção de dados) escrevem no log da API.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Todos são deslogados após um deploy | `Jwt:SigningKey` mudou |
| Webhook do GitHub/GitLab retorna 401/assinatura inválida após reinício | `DataProtectionKeysPath` não é persistente |
| Convite/redefinição "enviado" mas nada chega | `Email:Provider` ainda é `Log`, ou SMTP recusando (veja o log) |
| Tela de login mostra "Muitas tentativas" | Conta bloqueada por 5 erros seguidos (aguarde ou redefina a senha) ou limite por IP (aguarde 1 min) |
| Front mostra "Não foi possível conectar ao servidor" | `API_URL` errada ou API fora do ar |
| Usuário não pode ser desativado/excluído | Ele lidera um time: troque o líder antes |

## Pendências conhecidas

- `Dockerfile`, `docker-compose --profile full` e o job de imagem do CI ainda não foram executados num ambiente com Docker.
- Webhook real do GitHub/GitLab e SMTP real ainda não foram testados fora do ambiente local (dependem de URL pública e credenciais).
- Não há refresh token: ao fim das 8 h o usuário entra de novo.
