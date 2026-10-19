// Conteúdo do "Complemento do Relatório" (texto, quadros, figuras e códigos).
// Marcadores nos parágrafos: {f:chave} -> "Figura N", {q:chave} -> "Quadro N", {c:chave} -> "Código N".
// A numeração é calculada pela ordem em que os blocos aparecem (ver build-report.mjs).

const SRC = "Elaborado pelos autores (2026)";

export const FIRST_FIGURE = 22; // o relatório atual termina na Figura 21
export const FIRST_QUADRO = 16; // e no Quadro 15

const h1 = (text) => ({ type: "h1", text });
const h2 = (text) => ({ type: "h2", text });
const h3 = (text) => ({ type: "h3", text });
const p = (text) => ({ type: "p", text });
const ps = (text) => ({ type: "psingle", text });
const list = (items) => ({ type: "list", items });
const pageBreak = () => ({ type: "break" });
const piece = (title) => ({ type: "piece", title });
const fig = (key, file, title, widthCm = 16) => ({ type: "fig", key, file, title, widthCm });
const quadro = (key, title, header, rows, widths, opts = {}) => ({ type: "quadro", key, title, header, rows, widths, ...opts });
const code = (key, title, source, snippets, lang) => ({ type: "code", key, title, source, snippets, lang });

// ================================================================== Peça 0 — instruções
const instrucoes = [
    { type: "h1plain", text: "COMPLEMENTO DO RELATÓRIO FINAL – PIM III (TRILHO)" },
    p("Este arquivo reúne, separadamente, apenas o que falta no relatório: o capítulo de Desenvolvimento exigido pela atividade e os itens que o sumário já promete (resumo, abstract, seção 6.4, glossário e apêndices E e F). Nada da especificação existente (capítulos 1 a 6 e apêndices A a C) foi alterado. Esta página de instruções é só para você: apague-a antes de entregar."),
    h3("Como usar"),
    list([
        "Cada peça abaixo começa em página nova e já está formatada como o relatório (Arial 12, espaçamento 1,5, recuo de 1,25 cm, legenda acima e fonte abaixo). Copie a peça inteira (Ctrl+C) e cole no relatório (Ctrl+V), mantendo a formatação de origem se o Word perguntar.",
        "Ordem de colagem no relatório: Peça 1 (Resumo e Abstract) no lugar do texto-modelo; Peça 2 (seção 6.4) depois da seção 6.3.1; Peça 3 (Capítulo 7) logo antes de CONCLUSÃO; Peça 4 (Glossário) depois das referências; Peça 5 (Apêndice E) e Peça 6 (Apêndice F) no fim, depois do Apêndice C.",
        "Os títulos já vêm com os estilos Título 1, Título 2 e Título 3 e com a numeração digitada à mão (por exemplo, \"7.1\"). Se o Título 1 do seu relatório numerar sozinho, apague o \"7.\" digitado no título do capítulo.",
        "Depois de colar tudo: Ctrl+A e F9 para atualizar o sumário. As listas de figuras, de quadros e a nova lista de códigos são digitadas no seu relatório (veja o texto pronto abaixo).",
        "A numeração continua a do relatório atual: Figura 22 em diante, Quadro 16 em diante e Código 1 em diante. Todas as figuras, quadros e códigos são citados no texto antes de aparecerem.",
    ]),
    { type: "lists-to-update" },
    h3("Pontos do relatório atual que você deve decidir (não foram alterados)"),
    list([
        "Capa: \"Curso: Nome do Curso\" ainda é texto-modelo.",
        "Margens: o relatório usa 2,5 cm (esquerda e direita) e 3 cm (superior e inferior). A ABNT NBR 14724 pede 3 cm à esquerda e em cima, 2 cm à direita e embaixo.",
        "Numeração: a \"Figura 2\" aparece duas vezes (Modelo do projeto e Canvas do projeto). Os quadros 5W2H e comparativo estão sem \"Quadro N\". Os Quadros 14 e 15 (apêndices A e B) ficam depois dos quadros novos (16 a 22); para numeração estritamente sequencial, renumere esses dois para 22 e 23 e o Quadro de cenários de teste da Peça 6 para 24, ajustando as citações.",
        "O texto dos capítulos 5 e 6 está no futuro (\"será desenvolvido\") e descreve itens que o sistema entregue cumpre de outra forma (por exemplo, a priorização por IA é feita por regras explicáveis, não por modelo de aprendizado de máquina; as colunas do Kanban são fixas). O {q:previsto} do novo capítulo registra essas diferenças sem editar o texto antigo.",
        "Apêndices A e B: faltam as etapas de desenvolvimento e a participação real de cada integrante na construção do sistema. Só vocês sabem quem fez o quê.",
        "Apêndice D (Evidências da Validação do Protótipo) e Apêndice G (opcional) aparecem no sumário sem conteúdo; remova do sumário ou complete com as evidências do grupo.",
        "Sumário: \"REFERÊNCIAS (Exemplos)\" e \"GLOSSÁRIO (Opcional)\" ainda trazem o texto-modelo do título.",
    ]),
];

// ================================================================== Peça 1 — Resumo e Abstract
const resumo = [
    { type: "h1plain", text: "RESUMO" },
    ps("Este trabalho apresenta o Trilho, uma plataforma web de gestão de times, tarefas e projetos de desenvolvimento concebida para a Nexus Advanced Analytics, empresa de tecnologia que cresceu para quatro times técnicos sem uma ferramenta própria de planejamento. O problema identificado, e confirmado por pesquisa de campo com 18 empresas, é a falta de visibilidade sobre a carga de trabalho entre times, a priorização subjetiva das tarefas e o desalinhamento entre o planejamento e o andamento real do código. A solução reúne quadro Kanban colaborativo, gestão de times com líderes e três perfis de acesso, subtarefas, comentários e histórico, dashboard consolidado, notificações, sugestão de prioridade por regras explicáveis e integração com GitHub e GitLab, que atualiza o status das tarefas a partir de commits, pull requests e merges. O desenvolvimento seguiu o ciclo do Double Diamond e a prototipação em baixa e média fidelidade, resultando em um backend em .NET 8 organizado em camadas segundo os princípios SOLID, com Entity Framework Core e MySQL, e em um frontend em Next.js, React e TypeScript. O sistema foi verificado por 319 testes automatizados, incluindo testes unitários, de integração, de interface e uma matriz de permissões por perfil. O relatório descreve o problema, os requisitos, a arquitetura e as telas do sistema, comentando trechos relevantes do código-fonte e comparando o que foi especificado com o que foi entregue."),
    ps("Palavras-chave: Gestão de projetos. Kanban. Integração com Git. Priorização de tarefas. Engenharia de software."),
    { type: "h1plain", text: "ABSTRACT", pageBreak: true },
    ps("This paper presents Trilho, a web platform for managing development teams, tasks and projects designed for Nexus Advanced Analytics, a technology company that grew to four technical teams without a planning tool of its own. The problem, confirmed by a field survey of 18 companies, is the lack of visibility into workload across teams, subjective task prioritization and the mismatch between planning and the real progress of the code. The solution combines a collaborative Kanban board, team management with leaders and three access profiles, subtasks, comments and history, a consolidated dashboard, notifications, explainable rule-based priority suggestions and integration with GitHub and GitLab, which updates task status from commits, pull requests and merges. Development followed the Double Diamond cycle and low and medium fidelity prototyping, resulting in a .NET 8 backend organized in layers according to the SOLID principles, using Entity Framework Core and MySQL, and a frontend built with Next.js, React and TypeScript. The system was verified by 319 automated tests, including unit, integration and interface tests and a permission matrix by profile. The report describes the problem, requirements, architecture and screens of the system, discusses relevant source code excerpts and compares what was specified with what was delivered."),
    ps("Keywords: Project management. Kanban. Git integration. Task prioritization. Software engineering."),
];

// ================================================================== Peça 2 — seção 6.4
const secao64 = [
    h2("6.4 Modelagem e Projeto Físico do Banco de Dados"),
    p("O banco de dados do Trilho é relacional e foi implementado em MySQL 8, com o esquema mantido por migrações do Entity Framework Core a partir das entidades do domínio. O modelo possui doze tabelas e é apresentado, na {f:der}, no Diagrama Entidade-Relacionamento gerado automaticamente a partir do modelo do próprio framework, o que garante que o desenho corresponde ao esquema que de fato existe no banco. Para caber na página, cada tabela exibe apenas as chaves e os principais atributos; a relação completa de colunas está no {q:dicionario}."),
    fig("der", "25-der.png", "Diagrama Entidade-Relacionamento do banco de dados do Trilho", 16),
    p("As tabelas Users e Teams concentram as pessoas e os times; TeamMembers resolve o relacionamento muitos-para-muitos entre eles. Tasks guarda as tarefas do quadro Kanban, com as tabelas dependentes Subtasks, TaskComments e TaskActivities (histórico de alterações). Invites e PasswordResetRequests sustentam os fluxos de convite e de redefinição de senha, sem armazenar tokens ou códigos em texto aberto, apenas o seu hash. Notifications guarda os avisos internos, e GitRepositories e PendingGitEvents sustentam a integração com os provedores Git, incluindo a fila de eventos que aguardam processamento."),
    p("As regras de integridade referencial foram escolhidas conforme o significado de cada relação. O líder de um time (Teams.LeaderId) e o time de uma tarefa (Tasks.TeamId) usam restrição de exclusão, o que impede apagar quem lidera um time ou um time que possui tarefas. Responsáveis, criadores e autores usam a regra de definir como nulo, de modo que remover um usuário preserva o histórico de tarefas, comentários e atividades. Itens que não fazem sentido sem o pai, como subtarefas, comentários, histórico e notificações de uma tarefa, são removidos em cascata. O {q:dicionario} apresenta o dicionário de dados com as colunas, os tipos e as chaves de cada tabela."),
    { type: "dictionary", key: "dicionario", title: "Dicionário de dados do banco do Trilho" },
    p("O script completo de criação do esquema encontra-se no Apêndice E."),
];

// ================================================================== Peça 3 — Capítulo 7
const cap7 = [
    h1("7. Desenvolvimento do Sistema"),
    p("Este capítulo apresenta o sistema Trilho como foi desenvolvido. Descreve a organização do código e as tecnologias efetivamente empregadas, apresenta as telas em forma de manual do sistema, comenta os trechos de código-fonte que concentram as regras mais relevantes, resume a verificação por testes automatizados e compara o que foi especificado nos capítulos anteriores com o que foi entregue. As telas apresentadas foram capturadas do sistema em funcionamento, com dados fictícios da Nexus Advanced Analytics carregados pela própria API, de modo que cada figura reflete o comportamento real do software."),

    h2("7.1 Visão geral e organização do código"),
    p("O Trilho é composto por duas aplicações que se comunicam por HTTP: um frontend em Next.js e uma API em .NET 8 que acessa o banco MySQL. A {f:arquitetura} resume essa organização. O usuário acessa apenas o frontend; é o servidor do frontend que chama a API, enviando o token de autenticação (JWT) guardado em um cookie httpOnly. Dessa forma o token nunca fica acessível ao JavaScript do navegador. A API também recebe, de forma independente, os webhooks assinados enviados pelo GitHub e pelo GitLab."),
    fig("arquitetura", "24-arquitetura-camadas.png", "Arquitetura em camadas e fluxo de uma requisição no Trilho", 9.5),
    p("O backend segue a arquitetura em camadas e os princípios SOLID descritos na seção 6.2 e é dividido em seis projetos. Trilho.Domain contém as entidades, as regras que pertencem a elas e as interfaces dos repositórios e serviços. Trilho.Application contém um caso de uso por operação (por exemplo, criar tarefa, mover tarefa, processar evento Git), com os respectivos validadores. Trilho.Infrastructure implementa as interfaces do domínio: acesso a dados com Entity Framework Core, provedores GitHub e GitLab, envio de e-mail por SMTP, criptografia de segredos e tarefas em segundo plano. Trilho.Api expõe os controladores, as políticas de autorização e os middlewares. Trilho.Communication reúne os objetos de requisição e resposta, e Trilho.Exception reúne as exceções de negócio e as mensagens de erro em português e inglês."),
    p("Cada agregado possui repositórios separados de leitura, escrita e atualização, e as alterações são confirmadas por uma unidade de trabalho única, o que mantém cada caso de uso responsável por uma só coisa (princípio da responsabilidade única) e dependente apenas de abstrações (inversão de dependência). A API oferece onze grupos de endpoints (autenticação, usuários, times, tarefas, convites, redefinição de senha, notificações, dashboard, repositórios Git, webhooks e priorização) e três tarefas em segundo plano: aviso de prazo próximo, reprocessamento de eventos Git que falharam e limpeza de dados antigos."),
    p("No frontend, as páginas autenticadas ficam no grupo de rotas app/(app) e usam componentes de servidor e ações de servidor do Next.js. Toda chamada à API passa por uma camada exclusiva do servidor (app/lib/api), que converte os objetos da API para os tipos da interface, traduz erros em mensagens para o usuário e nunca é carregada pelo navegador. Os formulários são validados com esquemas zod, a mesma regra de senha é aplicada na interface e na API, e o arrasto de cartões do Kanban usa a biblioteca dnd-kit com atualização otimista da tela."),

    h2("7.2 Tecnologias utilizadas e etapas de construção"),
    h3("7.2.1 Tecnologias"),
    p("O {q:tecnologias} lista as tecnologias efetivamente utilizadas, com as versões do projeto. Em relação ao planejado no capítulo 5, as diferenças são o uso do Next.js 16 no lugar do 15 e a adoção do Vitest e do Playwright em vez do Jest para os testes do frontend."),
    quadro("tecnologias", "Tecnologias utilizadas no desenvolvimento do Trilho", ["Camada", "Tecnologia", "Finalidade"], [
        ["Backend", "C# com .NET 8 e ASP.NET Core Web API", "API REST em camadas, com injeção de dependência"],
        ["Backend", "Entity Framework Core 8.0.32 e Pomelo MySQL 8.0.2", "Mapeamento objeto-relacional e migrações"],
        ["Backend", "FluentValidation 12 e AutoMapper 16", "Validação de entradas e mapeamento entre objetos"],
        ["Backend", "JWT (HS256), BCrypt.Net-Next 4.0 e ASP.NET Data Protection", "Autenticação, hash de senhas e criptografia de segredos de webhook"],
        ["Banco de dados", "MySQL 8", "Persistência relacional"],
        ["Frontend", "Next.js 16.4 (App Router), React 19 e TypeScript", "Interface web com renderização no servidor"],
        ["Frontend", "Tailwind CSS 4, zod 4 e dnd-kit", "Estilo, validação de formulários e arrastar e soltar"],
        ["Testes", "xUnit 2.5 e Moq 4.20", "Testes unitários e de integração do backend"],
        ["Testes", "Vitest 5 e Playwright 1.64", "Testes unitários e de interface (ponta a ponta) do frontend"],
        ["Infraestrutura", "Docker, Docker Compose e GitHub Actions", "Contêineres, integração contínua e verificação de dependências"],
    ], [1900, 3900, 3270]),
    h3("7.2.2 Etapas de construção"),
    p("O desenvolvimento foi conduzido em versões incrementais sobre o repositório Git do projeto. O {q:etapas} resume as etapas, com os períodos obtidos do histórico de commits."),
    quadro("etapas", "Etapas de construção do sistema", ["Etapa", "Período (commits)", "Entregas principais"], [
        ["1. Estrutura inicial", "02/09/2026", "Solução .NET em camadas e projeto Next.js criados no repositório."],
        ["2. Interface", "10/09 a 21/09/2026", "Telas de login, ativação de conta, página inicial, dashboard e quadro Kanban, em modo demonstração (dados simulados)."],
        ["3. Backend e integração", "até 16/10/2026", "API completa (usuários, times, tarefas, convites, redefinição de senha, notificações, dashboard, Git e priorização), tarefas em segundo plano, segurança e integração do frontend com a API real."],
        ["4. Fechamento", "17/10/2026", "Envio de e-mail por SMTP, gestão de times e usuários, edição e exclusão de tarefas, filtros do Kanban, bloqueio de login, testes automatizados, integração contínua e documentação."],
    ], [2300, 2100, 4670]),

    h2("7.3 Manual do sistema: telas e funcionalidades"),
    p("Esta seção apresenta as principais telas do sistema, organizadas pelo fluxo de uso. Para cada tela são descritos a finalidade, o funcionamento e os perfis que têm acesso: Administrador/Gestor, Líder de Time e Membro. O menu lateral, presente em todas as telas após o login, dá acesso a Dashboard, Kanban, Times, Tarefas (priorização), Integrações Git e Configurações."),

    h3("7.3.1 Acesso e autenticação"),
    p("A {f:login} apresenta a tela de login, ponto de entrada do sistema. O usuário informa o e-mail corporativo e a senha e aciona o botão Entrar; se as credenciais forem válidas, a API devolve um token e o sistema abre o dashboard. Não existe cadastro público: as contas nascem de um convite ou da criação feita por um administrador. Por segurança, a mensagem de erro é a mesma para e-mail inexistente, senha errada ou conta desativada."),
    fig("login", "01-login.png", "Tela de login do sistema", 10.5),
    p("Quando o usuário esquece a senha, o link Esqueci minha senha abre a redefinição em três etapas. Na primeira etapa, ilustrada na {f:reset1}, ele informa o e-mail cadastrado e o sistema envia um código de seis dígitos, sem revelar se o e-mail existe."),
    fig("reset1", "03a-redefinir-etapa1.png", "Redefinição de senha, etapa 1: informar o e-mail", 10.5),
    p("Na segunda etapa, mostrada na {f:reset2}, o usuário digita o código recebido, que vale por 15 minutos e é invalidado após 5 tentativas erradas; o botão Reenviar código gera um novo código e inutiliza o anterior."),
    fig("reset2", "03b-redefinir-etapa2.png", "Redefinição de senha, etapa 2: confirmar o código", 10.5),
    p("Na terceira etapa, apresentada na {f:reset3}, o usuário define a nova senha. A lista de requisitos (mínimo de oito caracteres, letra maiúscula, letra minúscula, número e caractere especial) é marcada em tempo real e a mesma regra é aplicada pela API."),
    fig("reset3", "03c-redefinir-etapa3.png", "Redefinição de senha, etapa 3: definir a nova senha", 10.5),
    p("A {f:ativar} apresenta a tela de ativação de conta, aberta pelo link do e-mail de convite. O nome pode ser confirmado, enquanto o time e o e-mail aparecem bloqueados porque foram definidos por quem convidou. Ao definir a senha, a conta é ativada e o usuário é levado ao login. O convite vale por sete dias e só pode ser usado uma vez."),
    fig("ativar", "04-ativar-conta.png", "Tela de ativação de conta por convite", 10.5),
    p("Se a API deixar de aceitar o token da sessão (por expiração, desativação do usuário ou troca da chave de assinatura), o sistema apaga o cookie e leva o usuário ao login com o aviso exibido na {f:expirada}."),
    fig("expirada", "02-sessao-expirada.png", "Aviso de sessão expirada na tela de login", 10.5),
    p("Como proteção contra tentativas de adivinhar senhas, a conta é bloqueada por 15 minutos depois de cinco senhas erradas seguidas. Durante o bloqueio, mesmo a senha correta é recusada, com a mensagem da {f:bloqueio}. Redefinir a senha por e-mail desfaz o bloqueio."),
    fig("bloqueio", "05-bloqueio-conta.png", "Mensagem de bloqueio temporário da conta após tentativas falhas", 10.5),

    h3("7.3.2 Dashboard e notificações"),
    p("O dashboard, mostrado na {f:dashboard}, é a visão consolidada da liderança de engenharia. Os quatro indicadores do topo informam as tarefas ativas, as concluídas na sprint corrente, as atrasadas e os times ativos. O gráfico de barras horizontais mostra a carga de trabalho de cada time, calculada como tarefas em aberto dividido pela capacidade (membros multiplicados por oito tarefas), e um aviso em vermelho aparece quando algum time passa de 85% da capacidade. O gráfico de colunas mostra as tarefas concluídas em cada sprint de 14 dias. O administrador vê todos os times; o líder vê os que lidera; o membro vê o resumo dos próprios times."),
    fig("dashboard", "06-dashboard.png", "Dashboard consolidado entre times", 16),
    p("O sino no cabeçalho, aberto na {f:notificacoes}, concentra os avisos do usuário: tarefa atribuída a ele, mudança de status de uma tarefa sua (inclusive as feitas automaticamente pela integração Git) e prazo vencendo em até 48 horas. O número em vermelho indica quantas notificações ainda não foram lidas, e o link Marcar todas como lidas zera o contador."),
    fig("notificacoes", "13-notificacoes.png", "Painel de notificações do usuário", 16),

    h3("7.3.3 Quadro Kanban e tarefas"),
    p("A {f:kanban} apresenta o quadro Kanban de um time, tela central do sistema. As cinco colunas (Backlog, A Fazer, Em Andamento, Em Revisão e Concluído) mostram os cartões das tarefas com o título, a prioridade (P1 para alta, P2 para média, P3 para baixa ou Urgente), o responsável (iniciais) e marcas informativas: \"sugerida priorização\" quando a prioridade sugerida pelo sistema difere da atual, \"PR #52\" e \"em revisão\" para tarefas ligadas a um pull request, \"merged\" e \"Feito\" para as concluídas, e \"atrasada\", com borda vermelha, quando o prazo venceu. Para mudar o status, o usuário arrasta o cartão para outra coluna ou posição, com o mouse ou pelo teclado; a mudança é enviada à API e, se for recusada (por exemplo, concluir uma tarefa com subtarefas pendentes), o cartão volta ao lugar e a mensagem do motivo é exibida. Usuários que participam de mais de um time alternam entre eles pelos botões no cabeçalho."),
    fig("kanban", "07-kanban.png", "Quadro Kanban do time Backend", 16),
    p("Acima das colunas, a barra de filtros, apresentada na {f:filtros}, permite buscar tarefas pelo título e filtrar por responsável e por prioridade. Enquanto há filtro ativo, o contador informa quantas tarefas estão visíveis e o arrasto é desligado, porque as posições seriam calculadas sobre cartões escondidos; o botão Limpar filtros restaura o quadro."),
    fig("filtros", "08-kanban-filtros.png", "Filtros do quadro Kanban em uso", 16),
    p("O botão Nova tarefa abre o formulário da {f:novatarefa}, com título, descrição, time, responsável opcional, prazo e prioridade. Conforme o usuário preenche o prazo e o time, o sistema exibe a sugestão da IA: a prioridade calculada a partir do prazo e o responsável recomendado, que é o membro com menos tarefas em aberto. O usuário pode aceitar ou ignorar a recomendação. A tarefa criada entra na coluna Backlog e o evento é registrado no histórico."),
    fig("novatarefa", "09-nova-tarefa.png", "Formulário de criação de tarefa com sugestão da IA", 11),
    p("Ao clicar no título de um cartão, abre-se o detalhe da tarefa, na {f:detalhe}. A tela reúne os dados da tarefa (responsável, time, prazo e prioridade), a lista de subtarefas com barra de progresso, a área de comentários e o histórico de atividades, que registra quem fez cada alteração e quando. Qualquer membro do time pode editar a tarefa, marcar e adicionar subtarefas e comentar; apenas o líder do time e o administrador veem o botão Excluir, que pede confirmação e é recusado enquanto houver subtarefas pendentes."),
    fig("detalhe", "10-detalhe-tarefa.png", "Detalhe da tarefa com subtarefas e histórico", 16),
    p("Quando a tarefa está ligada a um repositório, o detalhe também exibe o cartão Integração Git, visto na {f:detalhegit}: a branch, o número e o estado do pull request e o horário do último commit, além do aviso de que a tarefa será movida para Concluído quando o PR for mesclado. O cartão Sugestão da IA explica, em linguagem simples, por que o sistema sugere outra prioridade."),
    fig("detalhegit", "11-detalhe-tarefa-git.png", "Detalhe de tarefa vinculada a um pull request", 16),
    p("O botão Editar abre o formulário da {f:editar}, no qual se alteram título, descrição, responsável, prazo e prioridade. Cada alteração relevante gera uma linha no histórico da tarefa."),
    fig("editar", "12-editar-tarefa.png", "Formulário de edição de tarefa", 11),

    h3("7.3.4 Gestão de times"),
    p("A {f:times} apresenta a lista de times em cartões, com o líder, o número de membros, as tarefas em aberto e a carga de trabalho percentual. O administrador cria times pelo botão Novo time, definindo obrigatoriamente o líder, e vê todos os times, inclusive os arquivados; o líder vê o cartão dos times de que participa e o botão Gerenciar só aparece no time que ele lidera."),
    fig("times", "14-times.png", "Lista de times com a carga de trabalho de cada um", 16),
    p("O botão Gerenciar abre a janela da {f:gerenciar}. Nela é possível editar o nome e a descrição, adicionar e remover membros, trocar o líder e, para o administrador, arquivar ou excluir o time. O líder atual não pode ser removido (é preciso trocá-lo antes), um usuário só lidera um time por vez e um time com tarefas não pode ser excluído; nesse caso o sistema orienta a arquivá-lo, o que o esconde do quadro e das listas sem apagar o histórico e pode ser desfeito."),
    fig("gerenciar", "15-gerenciar-time.png", "Janela de gerenciamento de um time", 10),

    h3("7.3.5 Priorização assistida"),
    p("A tela Tarefas, mostrada na {f:priorizacao}, apresenta a sugestão de priorização do time. As tarefas em aberto aparecem ordenadas por prioridade sugerida, cada uma com a justificativa em linguagem simples (por exemplo, \"Vitor tem 3 tarefas em aberto e prazo em 1 dia\"), a prioridade atual e a sugerida e o responsável. As tarefas marcadas manualmente como Urgente ficam sempre no topo. A sugestão é apenas uma recomendação: o botão Aplicar sugestões, disponível ao líder do time e ao administrador, grava as prioridades sugeridas e registra a mudança no histórico de cada tarefa."),
    fig("priorizacao", "16-priorizacao.png", "Sugestão de priorização por IA com justificativas", 16),

    h3("7.3.6 Integrações Git"),
    p("A tela Integrações Git, na {f:integracoes}, lista os repositórios conectados a cada time, com o provedor, o estado da conexão e o horário da última sincronização. O rodapé lembra a convenção que liga o código à tarefa: citar #123, task-123 ou trilho-123 no nome da branch, no título do pull request ou na mensagem do commit."),
    fig("integracoes", "17-integracoes-git.png", "Lista de repositórios Git conectados", 16),
    p("O botão Conectar repositório abre a janela da {f:conectar}, em que se escolhe o provedor (GitHub ou GitLab), o repositório no formato dono/repositório e o time responsável. Ao concluir, o sistema exibe uma única vez a URL do webhook e o segredo de assinatura, que devem ser cadastrados no provedor; o segredo é guardado criptografado. Apenas o administrador e o líder do próprio time conectam repositórios."),
    fig("conectar", "18-conectar-repositorio.png", "Janela de conexão de um repositório Git", 11),
    p("O botão Configurar de cada repositório abre a janela da {f:configurar}, que permite trocar o time responsável, escolher quais eventos o webhook processa (commit, pull request e merge) ou desconectar o repositório. A partir daí, abrir o pull request move a tarefa para Em Revisão e mesclá-lo move para Concluído; se ainda houver subtarefas pendentes, a tarefa permanece em revisão."),
    fig("configurar", "18b-configurar-repositorio.png", "Janela de configuração de um repositório Git", 11),

    h3("7.3.7 Configurações e gestão de usuários"),
    p("A tela Configurações, apresentada na {f:config}, é onde o administrador gerencia as pessoas. A tabela lista cada usuário com o perfil de acesso, que pode ser alterado diretamente em uma lista de seleção, e o status (Ativo, Inativo ou Convite pendente). Ao lado do status ficam as ações Desativar ou Reativar, que bloqueiam o acesso sem apagar o histórico, Excluir, que pede confirmação, e Cancelar para os convites pendentes. Quem lidera um time não pode ser desativado nem excluído, e ninguém executa essas ações sobre a própria conta. No lado direito, qualquer usuário edita o próprio nome e altera a própria senha."),
    fig("config", "19-configuracoes-admin.png", "Tela de configurações vista pelo administrador", 16),
    p("O botão Convidar usuário abre a janela da {f:convidar}, que recebe nome, e-mail, time de destino e perfil; o convidado recebe um e-mail com o link de ativação da {f:ativar}. O administrador pode convidar para qualquer time e perfil, enquanto o líder só convida membros para o time que lidera."),
    fig("convidar", "20-convidar-usuario.png", "Janela de convite de usuário", 11),
    p("Quando é preferível combinar a senha pessoalmente, o administrador usa o botão Criar usuário, na {f:criar}, que cria a conta já ativa com uma senha inicial que obedece à mesma regra de segurança."),
    fig("criar", "21-criar-usuario.png", "Janela de criação direta de usuário", 11),
    p("A {f:membro} mostra a mesma tela para um usuário com perfil de Membro. Ele enxerga apenas a própria linha, não tem os botões de convidar, criar nem as ações administrativas e pode editar o próprio nome e alterar a senha, informando a senha atual."),
    fig("membro", "22-configuracoes-membro.png", "Tela de configurações vista por um membro", 16),

    h3("7.3.8 Uso em dispositivos móveis"),
    p("A interface é responsiva. Na {f:celular}, em uma tela de 390 pixels de largura, o menu lateral se recolhe em um botão, o cabeçalho e a barra de filtros se reorganizam em linhas e o quadro Kanban passa a rolar na horizontal dentro da própria área do quadro, sem rolagem horizontal da página. Esse comportamento é verificado por testes automatizados em seis telas."),
    fig("celular", "23-kanban-celular.png", "Quadro Kanban em tela de celular", 6.5),

    h2("7.4 Perfis de acesso e segurança"),
    p("O controle de acesso combina três camadas: a interface esconde as ações que o perfil não pode executar, as políticas da API recusam as rotas restritas a administradores ou líderes e, dentro de cada caso de uso, as regras de negócio verificam a relação entre o usuário e o recurso (por exemplo, se ele é líder do time da tarefa). A camada que decide é sempre a API; a interface apenas evita oferecer botões que resultariam em erro. O {q:perfis} resume as permissões de cada perfil."),
    quadro("perfis", "Permissões por perfil de acesso", ["Ação", "Membro", "Líder de Time", "Administrador"], [
        ["Ver times e quadros", "Apenas os seus", "Apenas os seus", "Todos (inclusive arquivados)"],
        ["Criar, mover e editar tarefas; subtarefas e comentários", "No seu time", "No seu time", "Em todos os times"],
        ["Excluir tarefa e comentários de outras pessoas", "Não", "No time que lidera", "Sim"],
        ["Gerenciar o time (dados, membros)", "Não", "No time que lidera", "Todos os times"],
        ["Trocar o líder, arquivar e excluir time; criar time", "Não", "Não", "Sim"],
        ["Listar usuários e convidar", "Não", "Convida membros para o seu time", "Qualquer time e perfil"],
        ["Criar usuário, alterar perfil, desativar e excluir", "Não", "Não", "Sim (nunca a si mesmo)"],
        ["Conectar repositório Git e aplicar priorização", "Não", "No time que lidera", "Todos os times"],
        ["Editar o próprio nome e trocar a própria senha", "Sim", "Sim", "Sim"],
    ], [3200, 1700, 2000, 2170]),
    p("Além das permissões, foram aplicadas as seguintes medidas de segurança: senhas armazenadas com hash BCrypt; tokens JWT assinados, com validade de oito horas, que deixam de valer assim que a conta é desativada; cookie de sessão httpOnly; bloqueio da conta após cinco tentativas de login malsucedidas e limite de requisições por endereço nas rotas de autenticação; códigos de redefinição e tokens de convite guardados apenas como hash e de uso único; webhooks aceitos somente com assinatura HMAC válida (GitHub) ou token (GitLab); segredos de webhook criptografados no banco; identificador de correlação em cada resposta, para rastrear erros, e cabeçalhos de segurança HTTP."),

    h2("7.5 Trechos relevantes do código-fonte"),
    p("Esta seção apresenta trechos do código-fonte que concentram regras importantes do sistema. Foram escolhidos apenas os que demonstram uma lógica de negócio, uma decisão de segurança ou um mecanismo de interface relevante; telas de cadastro e consultas simples foram omitidas. Cada trecho indica o arquivo de origem e as linhas, e as reticências assinalam partes omitidas."),

    h3("7.5.1 Integração com repositórios Git e regras de tarefas"),
    p("O {c:referencia} mostra como o sistema descobre a quais tarefas um evento Git se refere. Uma expressão regular procura, no nome da branch, no título e na descrição do pull request e nas mensagens dos commits, as formas #128, task-128 e trilho-128; os números repetidos são descartados. É essa convenção, simples para a equipe, que permite ligar o código à tarefa sem nenhuma configuração manual."),
    code("referencia", "Extração das referências a tarefas em eventos Git", "backend/API/src/Trilho.Application/UseCases/Git/Shared/TaskReferenceExtractor.cs", [{ from: 8, to: 35 }], "csharp"),
    p("O {c:statusgit} apresenta a regra que atualiza o status da tarefa. Abrir o pull request move a tarefa para Em Revisão e registra o vínculo; mesclá-lo a conclui, exceto quando restam subtarefas pendentes (RF04), caso em que a tarefa permanece em revisão. Um simples push apenas atualiza a branch e o horário do último commit, e eventos de tarefas de outro time são ignorados, para que um repositório só mexa nas tarefas do próprio time."),
    code("statusgit", "Regra de atualização do status da tarefa a partir do pull request", "backend/API/src/Trilho.Application/UseCases/Git/Webhook/ProcessGitEventUseCase.cs", [{ startMarker: "switch (gitEvent.Kind)", endMarker: "case GitEventKind.PullRequestUpdated:", endExclusive: true }, { text: "            // ..." }, { startMarker: "case GitEventKind.PullRequestMerged:", endMarker: "break;" }], "csharp"),
    p("A segurança do webhook é tratada no {c:assinatura}. O GitHub assina o corpo da requisição com HMAC-SHA256 usando o segredo do repositório; o sistema recalcula a assinatura e a compara em tempo constante, o que impede tanto eventos forjados quanto ataques de temporização."),
    code("assinatura", "Verificação da assinatura HMAC do webhook do GitHub", "backend/API/src/Trilho.Infrastructure/Services/Git/GitHubProvider.cs", [{ startMarker: "public bool IsSignatureValid", blockFromMarker: true }], "csharp"),
    p("O {c:mover} implementa o movimento de uma tarefa entre colunas. Antes de mudar o status, a regra RF04 impede concluir a tarefa com subtarefas pendentes. Em seguida o caso de uso insere a tarefa na posição pedida, renumera a coluna inteira, registra a atividade no histórico e notifica os envolvidos, tudo confirmado em uma única transação."),
    code("mover", "Movimentação de tarefa com regra de subtarefas pendentes e reordenação", "backend/API/src/Trilho.Application/UseCases/Tasks/Move/MoveTaskUseCase.cs", [{ from: 57, to: 63 }, { text: "        // ..." }, { from: 68, to: 79 }, { text: "        // ..." }, { from: 81, to: 86 }], "csharp"),

    h3("7.5.2 Priorização, carga de trabalho e segurança"),
    p("O {c:prioridade} traz a regra de prioridade sugerida, deliberadamente simples e explicável: tarefa vencida é urgente, até sete dias é alta, até 21 dias é média e acima disso é baixa, e tarefa sem prazo é média. A mesma classe monta a justificativa em linguagem simples e a ordenação do ranking, em que as tarefas marcadas como urgentes pela liderança permanecem no topo."),
    code("prioridade", "Prioridade sugerida a partir do prazo da tarefa", "backend/API/src/Trilho.Application/Services/RuleBasedPrioritizationEngine.cs", [{ startMarker: "public string SuggestPriority", blockFromMarker: true }], "csharp"),
    p("O {c:carga} calcula a carga de trabalho do RF08: tarefas em aberto divididas pela capacidade do time, que é o número de membros multiplicado pelas tarefas que cada um comporta (oito, por configuração). O dashboard marca o time como sobrecarregado quando o percentual passa do limite configurado, que por padrão é 85%."),
    code("carga", "Cálculo da carga de trabalho por time e alerta de sobrecarga", "backend/API/src/Trilho.Application/Services/WorkloadCalculator.cs e GetDashboardUseCase.cs", [{ file: "backend/API/src/Trilho.Application/Services/WorkloadCalculator.cs", from: 3, to: 13 }, { text: "" }, { text: "// GetDashboardUseCase.cs" }, { file: "backend/API/src/Trilho.Application/UseCases/Dashboard/Get/GetDashboardUseCase.cs", from: 78, to: 89 }], "csharp"),
    p("O {c:login} mostra o bloqueio de contas por tentativas de login. Contas inexistentes ou desativadas recebem a mesma resposta de senha errada. Se a conta estiver bloqueada, a senha nem é conferida, o que impede que alguém descubra a senha correta durante o bloqueio. A cada senha errada o contador cresce e, ao atingir o limite configurado, grava-se o horário de fim do bloqueio; um login correto zera o contador."),
    code("login", "Bloqueio temporário da conta após tentativas de login malsucedidas", "backend/API/src/Trilho.Application/UseCases/Users/Login/LoginUseCase.cs", [{ from: 39, to: 76 }], "csharp"),
    p("O {c:permissao} reúne as regras de permissão sobre times. O método CanBeManagedBy, da entidade Team, expressa em uma linha quem pode gerenciar um time, e o TeamLeaderGuard garante que só um usuário ativo, com perfil de líder ou administrador e que ainda não lidere outro time, seja designado líder. As rotas restritas ainda recebem políticas de autorização na API, e os casos de uso aplicam essas regras antes de qualquer alteração."),
    code("permissao", "Regras de permissão sobre times e de designação de líder", "backend/API/src/Trilho.Domain/Entities/Team.cs e TeamLeaderGuard.cs", [{ file: "backend/API/src/Trilho.Domain/Entities/Team.cs", from: 17, to: 18 }, { text: "" }, { file: "backend/API/src/Trilho.Application/UseCases/Teams/Shared/TeamLeaderGuard.cs", from: 20, to: 45 }], "csharp"),

    h3("7.5.3 Interface"),
    p("O {c:arrasto} é a função do quadro Kanban que trata um cartão solto em outra coluna. A tela já foi atualizada de forma otimista pela biblioteca de arrastar e soltar; a função envia a mudança à API por uma ação de servidor e, se ela for recusada, restaura o estado anterior do quadro (guardado em move.rollback) e mostra o motivo. Assim a interface é rápida sem nunca divergir do que o servidor aceitou."),
    code("arrasto", "Atualização otimista do quadro com retorno ao estado anterior", "frontend/trilho-frontend/app/(app)/kanban/kanban-workspace/index.tsx", [{ from: 87, to: 99 }], "typescript"),
    p("O {c:sessao} mostra a camada de acesso à sessão. O arquivo proxy.ts apenas confere se existe um token não expirado no cookie; a verificação definitiva acontece aqui, consultando a API. Se a API responder 401, o usuário é redirecionado a uma rota que apaga o cookie e volta ao login com aviso; se a API estiver fora do ar, a tela degrada para os dados do token em vez de falhar. O redirecionamento fica fora do bloco try porque, no Next.js, ele é implementado como uma exceção."),
    code("sessao", "Obtenção do usuário logado e tratamento de sessão rejeitada", "frontend/trilho-frontend/app/lib/session/dal.ts", [{ from: 26, to: 48 }], "typescript"),
    p("O {c:filtro} implementa os filtros do quadro como uma função pura, sem depender de React, o que a torna fácil de testar. A busca ignora maiúsculas e acentos, os filtros se combinam (todos devem ser atendidos) e as colunas são mantidas mesmo quando ficam vazias."),
    code("filtro", "Filtragem dos cartões do quadro por título, responsável e prioridade", "frontend/trilho-frontend/app/(app)/kanban/kanban-board/filter-columns.ts", [{ startMarker: "function normalize", blockFromMarker: true }, { text: "" }, { startMarker: "export function filterColumns", blockFromMarker: true }], "typescript"),

    h3("7.5.4 Testes"),
    p("O {c:matriz} mostra o teste que verifica as permissões de todos os perfis. Cada linha da lista descreve quem faz o quê, sobre o recurso de qual time, e qual status HTTP é esperado; o mesmo método executa todas as linhas contra a API real, em memória, e informa, em caso de divergência, a linha, o perfil, a rota e a resposta recebida. São 78 combinações, que cobrem o que o {q:perfis} resume."),
    code("matriz", "Teste da matriz de permissões por perfil", "backend/API/tests/WebApi.Test/Permissions/RolePermissionMatrixTests.cs", [{ from: 157, to: 163 }, { text: "" }, { text: "    // Cada uma das 78 linhas da tabela segue este formato:" }, { startMarker: 'C("Membro A exclui o próprio comentário"', single: true }, { text: "" }, { startMarker: "public async Task Matrix", blockFromMarker: true, withAttributes: 2 }], "csharp"),

    h2("7.6 Testes e qualidade"),
    p("A qualidade foi verificada por testes automatizados em quatro níveis, resumidos no {q:testes}. Os testes unitários exercitam os casos de uso isoladamente, com dependências simuladas; os de integração sobem a API completa em memória e fazem requisições reais, passando pela autenticação, pelas políticas e pelo banco; os testes do frontend cobrem funções puras, esquemas de validação e mapeadores; e os de interface acionam um navegador de verdade para arrastar cartões, usar filtros, conferir as ações visíveis por perfil e checar o layout em tela de celular. O Apêndice F lista os principais cenários de teste. A integração contínua, definida no GitHub Actions, executa essas verificações a cada alteração, além da checagem de dependências vulneráveis."),
    quadro("testes", "Testes automatizados do sistema", ["Tipo", "Ferramenta", "Quantidade", "Escopo", "Resultado"], [
        ["Unitário (backend)", "xUnit e Moq", "86", "Casos de uso: usuários, login e bloqueio, times, tarefas, priorização, Git e notificações", "Aprovado"],
        ["Integração (backend)", "xUnit e Mvc.Testing", "164", "Endpoints completos, e-mail, jobs, webhooks e matriz de permissões (78 casos)", "Aprovado"],
        ["Unitário (frontend)", "Vitest", "41", "Mapeadores, esquemas de validação, regras de senha, filtros do quadro e mensagens de erro", "Aprovado"],
        ["Interface (E2E)", "Playwright", "28", "Login, arrastar com o mouse, filtros, ações por perfil e responsividade", "Aprovado"],
        ["Total", "", "319", "", "Aprovado"],
    ], [1750, 1500, 1350, 3350, 1120]),
    p("Além da suíte automática, o arrasto de cartões foi verificado manualmente contra a API real: uma conclusão recusada pelo servidor devolve o cartão à coluna de origem com a mensagem do motivo, e um movimento permitido persiste depois de recarregar a página."),

    h2("7.7 Comparativo entre o previsto e o entregue"),
    p("O {q:previsto} compara os requisitos especificados no capítulo 6 com o que foi entregue, indicando se cada item foi atendido integralmente, atendido com ajustes ou deixado como trabalho futuro. O registro das diferenças é parte da honestidade do projeto: algumas decisões foram tomadas durante a construção, quase sempre simplificando o escopo para entregar um produto confiável, e outras são limitações assumidas."),
    quadro("previsto", "Requisitos previstos e situação na versão entregue", ["Requisito", "Situação", "Observações"], [
        ["RF01 Cadastro e gestão de usuários", "Atendido com ajustes", "Três perfis, convite por e-mail e e-mail único atendidos. A senha exige também letra minúscula e aceita os especiais ! ? * . & $ # @. Acrescentados: criar usuário direto, desativar e reativar, trocar a própria senha e bloqueio por tentativas."],
        ["RF02 Gestão de times", "Atendido com ajustes", "Líder obrigatório, líder de um time por vez e troca de líder só pelo administrador atendidos. Só o administrador cria times; a exclusão é bloqueada para qualquer time com tarefas, e o arquivamento é a alternativa."],
        ["RF03 Gestão de tarefas", "Atendido com ajustes", "Atraso destacado e exclusão bloqueada com subtarefas pendentes atendidos. Não há botão específico para assumir tarefa do time; qualquer membro edita a tarefa e define o responsável."],
        ["RF04 Subtarefas", "Atendido com ajustes", "Progresso e bloqueio da conclusão atendidos. A API aceita responsável por subtarefa, mas a tela cria subtarefas apenas com título."],
        ["RF05 Quadro Kanban", "Atendido com ajustes", "Arrastar e soltar e histórico de toda mudança atendidos. As cinco colunas são fixas: a personalização pelo líder ficou como trabalho futuro."],
        ["RF06 Integração com Git", "Atendido com ajustes", "GitHub e GitLab, PR aberto para Em Revisão, merge para Concluído e fila de reprocessamento atendidos. O vínculo é automático pela citação do número da tarefa, em vez de informado manualmente. O bloqueio da conclusão manual com PR aberto não foi implementado."],
        ["RF07 Priorização por IA", "Atendido com ajustes", "Sugestão de prioridade e de responsável, justificativa, urgência manual no topo e decisão final do líder atendidos, por regras explicáveis (prazo e carga por pessoa). O modelo de aprendizado de máquina com histórico de conclusão ficou como trabalho futuro."],
        ["RF08 Dashboard e notificações", "Atendido com ajustes", "Indicadores, carga por time, alerta acima de 85% e notificações internas (atribuição, mudança de status e prazo em 48 horas) atendidos. Notificações de tarefas por e-mail não foram implementadas; o e-mail é usado em convites e na redefinição de senha."],
        ["RNF01 Segurança", "Atendido", "Hash BCrypt, JWT, cookie httpOnly e webhooks assinados. O HTTPS depende da hospedagem, ainda não realizada."],
        ["RNF02 Disponibilidade", "Pendente", "O sistema ainda não foi publicado. Há verificações de saúde, Docker e integração contínua preparados para a publicação."],
        ["RNF03 Desempenho", "Não medido", "Não houve medição formal do tempo de carregamento do quadro."],
        ["RNF04 Responsividade", "Atendido", "Verificado por testes automáticos em tela de 375 pixels."],
        ["RNF05 Acessibilidade", "Parcial", "Rótulos, nomes acessíveis e foco nas janelas verificados automaticamente; faltam a auditoria completa e testes com leitor de tela."],
        ["RNF06 Manutenibilidade", "Atendido", "Camadas, injeção de dependência, repositórios por agregado e 319 testes automatizados."],
        ["RNF07 Conformidade com a LGPD", "Parcial", "Dados mínimos, senhas com hash e limpeza periódica de tokens e eventos antigos. Faltam política de privacidade e fluxo formal de solicitação do titular."],
    ], [2400, 1500, 5170]),

    h2("7.8 Ambiente de execução e implantação"),
    p("Durante o desenvolvimento o sistema foi executado em ambiente local: o banco MySQL em contêiner Docker (arquivo docker-compose.yml), a API com o comando dotnet run e o frontend com npm run dev, configurado por variáveis de ambiente e pelo armazenamento de segredos do .NET, de modo que nenhuma senha fica no código. O repositório inclui o Dockerfile da API, o fluxo de integração contínua do backend e do frontend e os guias de operação e do usuário. A publicação em uma máquina virtual, descrita na seção 5.1 como modelo IaaS, é a etapa seguinte do projeto e, portanto, o sistema ainda não está disponível publicamente na data deste relatório."),
];

// ================================================================== Peça 4 — Glossário
const glossario = [
    { type: "h1plain", text: "GLOSSÁRIO" },
    ...[
        ["API REST", "Interface de programação que expõe funções do sistema por meio de requisições HTTP, trocando dados em formato JSON."],
        ["Backlog", "Lista de tarefas ainda não iniciadas; primeira coluna do quadro Kanban."],
        ["Branch", "Ramificação do repositório Git em que se desenvolve uma alteração isolada do código principal."],
        ["Commit", "Registro de um conjunto de alterações no repositório Git."],
        ["Dashboard", "Painel que consolida indicadores do sistema em uma única tela."],
        ["Docker", "Plataforma que empacota aplicações em contêineres, garantindo o mesmo ambiente de execução em qualquer máquina."],
        ["HMAC", "Código de autenticação de mensagem baseado em função de hash e chave secreta, usado para assinar os webhooks."],
        ["JWT", "JSON Web Token: token assinado que identifica o usuário autenticado nas requisições à API."],
        ["Kanban", "Método visual de gestão em que as tarefas fluem por colunas que representam seu estado."],
        ["MVP", "Produto Mínimo Viável: versão inicial com as funcionalidades essenciais."],
        ["ORM", "Mapeamento objeto-relacional: técnica que associa classes do código a tabelas do banco de dados."],
        ["Pull request", "Pedido para incorporar uma branch ao código principal, geralmente acompanhado de revisão."],
        ["Rate limit", "Limite de requisições por período, usado para reduzir abusos e tentativas de adivinhar senhas."],
        ["SOLID", "Conjunto de cinco princípios de projeto orientado a objetos que favorecem código coeso e de fácil manutenção."],
        ["Sprint", "Período fixo de trabalho (neste sistema, 14 dias) usado para medir entregas."],
        ["Webhook", "Chamada HTTP que um sistema faz automaticamente a outro quando ocorre um evento, como um pull request mesclado."],
    ].map(([term, def]) => ({ type: "glossary", term, def })),
];

// ================================================================== Peça 5 — Apêndice E
const apendiceE = [
    { type: "h1plain", text: "APÊNDICE E – Scripts SQL do BD" },
    p("O {c:sql} apresenta o script de criação do esquema do banco do Trilho em MySQL 8, obtido do banco em que as migrações do Entity Framework Core foram aplicadas. Ele cria as doze tabelas, as chaves primárias e estrangeiras, os índices e as regras de exclusão descritas na seção 6.4."),
    { type: "sqlcode", key: "sql", title: "Script de criação do esquema do banco de dados do Trilho", file: "docs/relatorio/dados/schema.sql" },
];

// ================================================================== Peça 6 — Apêndice F
const apendiceF = [
    { type: "h1plain", text: "APÊNDICE F – Cenários de Teste" },
    p("O {q:cenarios} apresenta os principais cenários de teste do sistema, cada um associado ao teste automatizado que o executa. Todos foram executados em 17/10/2026 e apresentaram o resultado esperado. Os testes do backend estão no projeto WebApi.Test (integração) e UseCases.Test (unitários), e os do frontend, nas pastas app e e2e do projeto trilho-frontend."),
    { type: "scenarios", key: "cenarios", title: "Cenários de teste do sistema Trilho" },
];

// ------------------------------------------------------------------ cenários (derivados dos testes reais)
export const SCENARIOS = [
    ["CT01", "Login válido", "Informar e-mail e senha corretos", "Token devolvido (200)", "Login_ReturnsOk"],
    ["CT02", "Login com senha incorreta", "Informar senha errada", "Acesso negado (401)", "Login_WrongPassword_ReturnsUnauthorized"],
    ["CT03", "Conta desativada", "Desativar o usuário e tentar entrar ou usar o token", "Login recusado e token antigo rejeitado; reativar restaura o acesso", "SetStatus_Deactivate_BlocksLoginAndExistingToken_ThenReactivates"],
    ["CT04", "Bloqueio por tentativas", "Errar a senha cinco vezes e tentar a senha correta", "Conta bloqueada (429), mesmo com a senha correta", "Login_AfterTooManyWrongPasswords_LocksTheAccount_EvenForTheRightPassword"],
    ["CT05", "Desbloqueio por redefinição", "Redefinir a senha de uma conta bloqueada", "Login volta a funcionar", "Login_Lockout_IsClearedByAPasswordReset"],
    ["CT06", "Convite e ativação", "Convidar, abrir o link, definir a senha e entrar", "Usuário criado no time; link de uso único", "Invite_FullFlow_CreatesUserInTeam_AndTokenIsSingleUse"],
    ["CT07", "Limites do convite", "Líder convida perfil elevado ou outro time; membro convida", "Todas as tentativas recusadas (403)", "Invite_LeaderCannotInviteElevatedRole_OrOtherTeam_OrMemberCannotInvite"],
    ["CT08", "Redefinição de senha", "Solicitar código, verificar e definir nova senha", "Senha alterada; código não pode ser reutilizado", "PasswordReset_FullFlow_ChangesPassword_AndCodeIsSingleUse"],
    ["CT09", "Código com tentativas excessivas", "Errar o código além do limite", "Código invalidado", "PasswordReset_TooManyWrongAttempts_InvalidatesTheCode"],
    ["CT10", "E-mail inexistente na redefinição", "Solicitar código para e-mail não cadastrado", "Resposta idêntica à de e-mail cadastrado e nenhum envio", "PasswordReset_UnknownEmail_LooksIdentical_AndSendsNothing"],
    ["CT11", "Troca da própria senha", "Informar senha atual incorreta", "Pedido recusado (400)", "ChangePassword_WithWrongCurrentPassword_ReturnsBadRequest"],
    ["CT12", "Criação de time", "Administrador cria time com líder", "Time criado e líder incluído como membro", "Create_AsAdmin_ReturnsTeamWithLeaderAsMember"],
    ["CT13", "Líder de um time por vez", "Designar como líder quem já lidera outro time", "Conflito (409)", "Create_LeaderAlreadyLeadsAnotherTeam_ReturnsConflict"],
    ["CT14", "Troca de líder", "Administrador troca o líder do time", "Novo líder assume e o antigo permanece membro", "ChangeLeader_MovesLeadershipAndKeepsOldLeaderAsMember"],
    ["CT15", "Proteção de líderes", "Excluir ou rebaixar usuário que lidera um time", "Operação recusada (409)", "UserLeadingTeam_CannotBeDeleted_NorLoseLeaderRole"],
    ["CT16", "Exclusão de time", "Excluir time que possui tarefas", "Conflito (409); arquivar é a alternativa", "DeleteTeam_WithTasks_IsConflict"],
    ["CT17", "Arquivar e restaurar", "Arquivar o time e depois restaurá-lo", "Some das listas e bloqueia alterações; restaurar desfaz", "Archive_HidesFromListAndBlocksChanges_ThenRestore"],
    ["CT18", "Visibilidade de times", "Membro lista os times e abre time alheio", "Vê só os próprios; time alheio é proibido (403)", "GetAll_AsMember_ReturnsOnlyOwnTeams_AndGetByIdIsForbiddenForOthers"],
    ["CT19", "Criação de tarefa", "Membro cria tarefa", "Tarefa no Backlog com histórico de criação", "Create_AsMember_ReturnsTaskInBacklog_AndRecordsCreatedActivity"],
    ["CT20", "Responsável fora do time", "Criar tarefa com responsável de outro time ou por quem não é do time", "Pedido recusado", "Create_ByNonMember_IsForbidden_AndAssigneeOutsideTeamIsRejected"],
    ["CT21", "Mover tarefa", "Mover cartão entre colunas e posições", "Coluna reordenada e atividade registrada", "Board_ReturnsOnlyTasksOfUsersTeams_AndMoveReordersColumn"],
    ["CT22", "Concluir com subtarefas pendentes", "Mover para Concluído com subtarefa pendente", "Conflito (409); concluída após finalizar as subtarefas", "Move_ToDone_RequiresAllSubtasksDone_AndSetsCompletedAt"],
    ["CT23", "Excluir tarefa", "Membro, líder e administrador tentam excluir; tarefa com subtarefa pendente", "Só líder e administrador; bloqueada com pendências", "Delete_OnlyLeaderOrAdmin_AndBlockedWithPendingSubtasks"],
    ["CT24", "Excluir comentário", "Autor, líder e outro membro tentam excluir", "Autor e líder podem; outro membro não", "Comments_AuthorOrLeaderCanDelete_OtherMemberCannot"],
    ["CT25", "Webhook com assinatura inválida", "Enviar evento sem assinatura válida", "Recusado (401) sem alterar nada", "Webhook_InvalidSignature_IsUnauthorized_AndChangesNothing"],
    ["CT26", "Pull request aberto e mesclado", "Abrir e mesclar o PR de uma tarefa", "Em Revisão ao abrir; Concluído ao mesclar", "Webhook_PullRequestOpenedThenMerged_MovesTaskToReviewThenDone"],
    ["CT27", "Merge com subtarefas pendentes", "Mesclar PR de tarefa com subtarefas pendentes", "Tarefa permanece em Em Revisão", "Merge_WithPendingSubtasks_KeepsTaskInReview"],
    ["CT28", "Push de código", "Enviar commits citando a tarefa", "Atualiza branch e último commit sem mudar o status", "Webhook_Push_UpdatesBranchAndLastCommit_WithoutMovingTask"],
    ["CT29", "Tarefa de outro time", "Evento cita tarefa de outro time", "Referência ignorada", "TaskFromAnotherTeam_IsIgnored"],
    ["CT30", "Falha no processamento", "Evento falha e é reprocessado", "Permanece na fila, repositório marcado com erro, reprocesso informa o resultado", "FailedEvent_StaysInQueue_MarksRepositoryAsError_AndRetryReportsIt"],
    ["CT31", "Prioridade pelo prazo", "Calcular prioridade para prazos diversos", "Urgente, alta, média ou baixa conforme as faixas", "SuggestPriority_FollowsDeadlineRules"],
    ["CT32", "Urgente declarada no topo", "Ranking com tarefa urgente e prazo distante", "Urgente permanece em primeiro", "Rank_DeclaredUrgentAlwaysOnTop_EvenWithFarDeadline"],
    ["CT33", "Aplicar priorização", "Membro e líder de outro time tentam aplicar", "Recusado (403)", "Apply_ByMember_IsForbidden_AndByOtherTeamsLeader_IsForbidden"],
    ["CT34", "Dashboard do líder", "Líder consulta o dashboard", "Só o próprio time, com carga e atrasadas", "Dashboard_Leader_SeesOnlyTheirTeam_WithWorkloadAndOverdue"],
    ["CT35", "Notificações", "Atribuir tarefa e mudar status", "Responsável notificado; pode marcar como lida", "Notifications_AssignmentAndStatusChange_NotifyTheAssignee_AndCanBeMarkedRead"],
    ["CT36", "Aviso de prazo", "Executar a tarefa em segundo plano repetidamente", "Um único aviso por tarefa", "Notifications_DueSoonJob_CreatesOneWarningPerTask"],
    ["CT37", "Matriz de permissões", "78 combinações de perfil, ação e recurso", "Todas com o status HTTP esperado", "RolePermissionMatrixTests.Matrix"],
    ["CT38", "Arrastar com o mouse", "Arrastar um cartão de Backlog para A Fazer", "Cartão muda de coluna", "kanban.spec: arrastar um card com o mouse muda de coluna"],
    ["CT39", "Filtros do quadro", "Buscar por título e filtrar por prioridade", "Somente os cartões que atendem; limpar restaura", "kanban.spec: busca e filtro de prioridade"],
    ["CT40", "Ações por perfil na interface", "Percorrer as telas como membro, líder e administrador", "Cada perfil vê apenas as ações permitidas", "roles.spec (14 testes)"],
    ["CT41", "Responsividade", "Abrir seis telas em 375 pixels", "Sem rolagem horizontal da página", "responsive.spec (6 testes)"],
    ["CT42", "Sessão expirada", "Acessar a rota de sessão expirada", "Login com aviso de sessão expirada", "auth.spec: sessão expirada leva ao login com o aviso"],
    ["CT43", "Recusa do servidor ao arrastar", "Arrastar para Concluído uma tarefa com subtarefa pendente (API real)", "Cartão volta à coluna e a mensagem é exibida; execução manual com Playwright", "Verificação manual contra a API real"],
];

export const PIECES = [
    { id: 0, title: "Instruções (apague antes de entregar)", blocks: instrucoes },
    { id: 1, title: "Peça 1 – Resumo e Abstract (no lugar do texto-modelo)", blocks: resumo },
    { id: 2, title: "Peça 2 – Seção 6.4 (depois da seção 6.3.1)", blocks: secao64 },
    { id: 3, title: "Peça 3 – Capítulo 7 (antes de CONCLUSÃO)", blocks: cap7 },
    { id: 4, title: "Peça 4 – Glossário (depois das referências)", blocks: glossario },
    { id: 5, title: "Peça 5 – Apêndice E (depois do Apêndice C)", blocks: apendiceE },
    { id: 6, title: "Peça 6 – Apêndice F", blocks: apendiceF },
];

export { SRC };
