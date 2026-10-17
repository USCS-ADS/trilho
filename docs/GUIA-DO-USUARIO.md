# Trilho — guia do usuário

O Trilho organiza o trabalho do time em um quadro Kanban, avisa prazos e sugere prioridades. Não há autocadastro: você entra
por **convite** (ou por uma conta criada por um administrador).

## Primeiro acesso

1. Abra o e-mail do convite e clique no link de ativação.
2. Defina uma senha: mínimo de 8 caracteres, com maiúscula, minúscula, número e um caractere especial (`! ? * . & $ # @`).
3. Entre com o e-mail do convite e a senha escolhida.

**Esqueci a senha:** na tela de login, "Esqueci a senha" → informe o e-mail → digite o código de 6 dígitos que chega por
e-mail (vale 15 minutos) → defina a nova senha. Depois de **5 senhas erradas seguidas** a conta fica bloqueada por 15 minutos;
redefinir a senha também libera.

**Trocar a senha:** Configurações → "Alterar senha" (pede a senha atual).

## Perfis de acesso

| | Membro | Líder de Time | Administrador |
|---|---|---|---|
| Ver os times de que participa e seus quadros | ✔ | ✔ | todos os times |
| Criar e mover tarefas, comentar, subtarefas | ✔ | ✔ | ✔ |
| Editar uma tarefa | ✔ (do seu time) | ✔ | ✔ |
| Excluir tarefa / moderar comentários | — | ✔ (do seu time) | ✔ |
| Gerenciar o time (dados, membros, trocar líder) | — | ✔ (do seu time) | ✔ |
| Convidar pessoas | — | ✔ (só para o seu time, como Membro) | ✔ (qualquer time e perfil) |
| Criar usuário direto, mudar perfil, desativar/excluir usuário | — | — | ✔ |
| Criar, arquivar e excluir times | — | — | ✔ |
| Conectar repositórios Git | — | ✔ (do seu time) | ✔ |

A interface esconde o que você não pode fazer; o servidor confere a permissão de qualquer forma.

## Quadro Kanban

- Escolha o time pelas abas no topo. As colunas são **Backlog → A Fazer → Em Andamento → Em Revisão → Concluído**.
- **Arraste** um card para outra coluna ou para outra posição. Se o servidor recusar (por exemplo, concluir uma tarefa com
  subtarefas pendentes), o card volta e aparece o motivo.
- **Nova tarefa:** título, descrição, responsável (ou o time inteiro), prazo e prioridade.
- **Buscar e filtrar:** a barra acima do quadro filtra por título, responsável e prioridade. Com filtro ativo o arrasto fica
  desligado (há cards escondidos); clique em "Limpar filtros" para voltar a reordenar.
- Cards com prazo vencido e não concluídos ficam destacados como **atrasados**.

## Detalhe da tarefa

Clique no título do card. Lá você vê e altera:

- **Editar** título, descrição, responsável, prazo e prioridade (cada mudança vai para o **histórico**).
- **Subtarefas** (marcar como feitas, excluir) e **comentários** (o autor ou um líder/administrador pode excluir).
- **Excluir a tarefa** (líder/administrador) — pede confirmação e é recusada enquanto houver subtarefas pendentes.
- Vínculo **Git** e **sugestão de prioridade** quando existirem.

## Dashboard, notificações e prioridades

- **Dashboard:** visão do sprint (janela de datas), tarefas atrasadas e carga de trabalho por time.
- **Sino:** avisos como "prazo em até 48 h", tarefas atribuídas e eventos Git. Marque como lidas.
- **Sugestão de priorização:** o sistema sugere a prioridade pelo **prazo** (vencido → urgente; até 7 dias → alta; até 21 → média; depois → baixa; sem prazo → média), ordena as tarefas abertas e explica o motivo;
  você decide se aplica.

## Integração com Git

Líderes e administradores conectam repositórios do **GitHub** ou **GitLab** em *Integrações Git*; a tela mostra a URL do
webhook e o segredo para colar no provedor.

Para ligar commits e pull requests a uma tarefa, cite o número dela no **nome da branch, no título do PR ou na mensagem do
commit**, em qualquer destas formas: `#123`, `task-123` ou `trilho-123`. Exemplos:

- branch `feature/task-123-filtro-kanban`
- commit `corrige ordenação do board (#123)`

O card passa a mostrar a branch e o PR. Ao **abrir** o PR a tarefa vai para *Em Revisão*; ao **mesclar**, vai para *Concluído* — ou fica em *Em Revisão* se ainda houver subtarefas pendentes.

## Times (líder e administrador)

Em *Times*, o botão **Gerenciar** permite editar nome/descrição, adicionar e remover membros, trocar o líder e **arquivar**
(restaurável) ou **excluir**. Um time com tarefas não pode ser excluído — arquive-o. O líder não pode ser removido: troque o
líder antes.

## Usuários (administrador)

Em *Configurações*:

- **Convidar usuário** (e-mail de ativação) ou **Criar usuário** com senha inicial combinada com a pessoa.
- Alterar o **perfil** na própria linha da tabela.
- **Desativar** (a pessoa perde o acesso na hora; histórico preservado; dá para reativar) ou **Excluir** (definitivo).
  Quem lidera um time não pode ser desativado nem excluído; você também não pode fazer isso com a própria conta.
