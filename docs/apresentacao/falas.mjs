// Texto de fala de cada slide (vai para as anotações do orador e para o roteiro-fala.md).
// Ordem = ordem dos slides. "reserva" = slides fora dos 7 minutos, usados só se houver perguntas.
export const falas = [
    {
        id: "capa",
        quem: "Ana Luiza",
        texto:
            "Olá, professora e colegas. Somos o grupo do Trilho, um sistema de gestão de tarefas e times de desenvolvimento, " +
            "feito no Projeto de Extensão de Análise e Desenvolvimento de Sistemas da USCS, para o cliente Nexus Advanced Analytics. " +
            "Eu sou a Ana Luiza e, junto com o Arthur, a Giovanna, o Raphael e o Vitor, vamos apresentar o sistema nos próximos sete minutos.",
    },
    {
        id: "problema",
        quem: "Ana Luiza",
        texto:
            "A Nexus tem vários times de desenvolvimento: Backend, Dados, Frontend e Machine Learning. E o que encontramos foi um problema comum: " +
            "a gestão das tarefas não acompanhava o trabalho real. Primeiro, ninguém tinha uma visão consolidada do que cada time estava fazendo. " +
            "Segundo, a prioridade das tarefas técnicas não seguia um critério claro: cada um decidia à sua maneira. " +
            "E terceiro, o planejamento ficava separado do código-fonte: o commit acontecia em um lugar e o quadro de tarefas ficava desatualizado em outro. " +
            "O Trilho nasceu para juntar essas três pontas em um só sistema.",
    },
    {
        id: "perfis",
        quem: "Arthur Rodrigues",
        texto:
            "O Trilho é uma aplicação web com quadro Kanban por time, dashboard consolidado e integração com GitHub e GitLab. " +
            "O acesso é organizado em três perfis. O membro vê os times de que participa, cria e move tarefas, comenta e usa subtarefas. " +
            "O líder faz tudo isso e ainda gerencia o próprio time, conecta repositórios Git e convida novos membros. " +
            "O administrador enxerga todos os times, cria, arquiva e exclui times, e gerencia usuários e convites. " +
            "E um detalhe importante: não existe autocadastro. Ninguém entra sem um convite ou sem uma conta criada pelo administrador.",
    },
    {
        id: "dashboard-kanban",
        quem: "Arthur Rodrigues",
        texto:
            "Esta é a visão que faltava para a gestão. O dashboard consolidado mostra as tarefas ativas, as concluídas na sprint, as atrasadas e os times ativos, " +
            "além da carga de trabalho de cada time e das tarefas concluídas por sprint. " +
            "Embaixo, o quadro Kanban de um time, com as colunas Backlog, A fazer, Em andamento, Em revisão e Concluído. " +
            "As tarefas são arrastadas de uma coluna para outra e dá para filtrar por responsável e por prioridade. " +
            "As etiquetas mostram a prioridade, se a tarefa está atrasada e se existe um pull request ligado a ela.",
    },
    {
        id: "priorizacao",
        quem: "Giovanna Tamos",
        texto:
            "Cada tarefa tem prazo, responsável, subtarefas, comentários e histórico. Na criação, o sistema já sugere o responsável com menor carga de trabalho. " +
            "E a tela de priorização ordena as tarefas do time por uma prioridade sugerida, calculada a partir do prazo e da carga de cada pessoa, " +
            "e explica o motivo de cada sugestão, como \"Vitor tem 3 tarefas em aberto e o prazo vence hoje\". " +
            "É só uma recomendação: a decisão final continua com o líder. Hoje a sugestão usa regras e o motor pode ser trocado por um modelo de inteligência artificial " +
            "sem mexer no resto do sistema. E quando o prazo se aproxima, o responsável recebe uma notificação.",
    },
    {
        id: "git",
        quem: "Giovanna Tamos",
        texto:
            "O grande diferencial é a integração com o Git. O líder conecta o repositório do time, do GitHub ou do GitLab, " +
            "e o Trilho passa a receber os eventos de commit, pull request e merge por webhook. " +
            "Basta citar o número da tarefa, como hashtag 123 ou task-123, na branch, no commit ou no pull request, e a tarefa fica ligada ao código. " +
            "Quando o pull request é aberto, a tarefa vai sozinha para Em revisão, e quando ele é mesclado, vai para Concluído. " +
            "Cada webhook é validado por assinatura HMAC, e os eventos que falham são reprocessados depois.",
    },
    {
        id: "admin-seguranca",
        quem: "Raphael Carneiro",
        texto:
            "Na administração, o administrador convida pessoas por e-mail ou cria a conta diretamente. O convite gera um link para a pessoa ativar a conta e definir a própria senha. " +
            "Na parte de segurança: as senhas são guardadas com BCrypt, a sessão fica em um cookie httpOnly, " +
            "depois de cinco senhas erradas a conta é bloqueada por quinze minutos, as rotas de login têm limite de requisições, " +
            "e trocar a senha encerra todas as outras sessões abertas.",
    },
    {
        id: "arquitetura",
        quem: "Raphael Carneiro",
        texto:
            "Por dentro, o front-end é Next.js com React, e só o servidor do Next conversa com a API. " +
            "A API é .NET 8 em Clean Architecture: controladores, camada de aplicação com os casos de uso, domínio com as entidades e regras, " +
            "e infraestrutura com Entity Framework, e-mail, tarefas em segundo plano e Git. " +
            "O banco é MySQL 8, com doze tabelas. São onze controladores e cinquenta e dois endpoints. " +
            "As notificações de prazo, o reprocessamento de eventos do Git e a limpeza de dados antigos rodam como tarefas em segundo plano. " +
            "Tudo roda em contêineres Docker e é validado automaticamente pelo GitHub Actions.",
    },
    {
        id: "qualidade",
        quem: "Vitor Medina",
        texto:
            "Para garantir a qualidade, temos cento e sessenta e sete testes automatizados no backend, quarenta e um testes unitários no front-end " +
            "e trinta e nove testes de ponta a ponta, que incluem verificação de acessibilidade com a ferramenta axe. " +
            "Os testes do backend cobrem as regras de negócio, os endpoints, o envio de e-mail e os webhooks; os de ponta a ponta percorrem as telas do sistema. " +
            "A integração contínua roda tudo a cada alteração. E o quadro também funciona no celular, com colunas roláveis.",
    },
    {
        id: "fecho",
        quem: "Vitor Medina",
        texto:
            "Resumindo: o sistema está completo e funcionando em ambiente local, com Kanban, times, usuários, convites, integração com Git, dashboard e testes automatizados. " +
            "Ele resolve os três problemas do início: dá visão consolidada, critério de prioridade e liga o planejamento ao código. " +
            "Os próximos passos são colocá-lo no ar em um servidor, testar o envio real de e-mails e validar o webhook com um repositório real. " +
            "Muito obrigado! Ficamos à disposição para as perguntas.",
    },
    {
        id: "r-der",
        reserva: true,
        quem: "Qualquer integrante",
        texto:
            "Modelo de dados, se perguntarem: doze tabelas no MySQL 8. As principais são usuários, times, participações, tarefas, subtarefas, comentários, histórico de atividades, " +
            "convites, pedidos de redefinição de senha, notificações, repositórios Git e eventos Git pendentes.",
    },
    {
        id: "r-perguntas",
        reserva: true,
        quem: "Quem for perguntado",
        texto:
            "Perguntas prováveis: a priorização usa inteligência artificial? Hoje usa regras de prazo e carga, por trás de uma interface que permite trocar por um modelo de IA. " +
            "Como o sistema protege os dados? Senhas com BCrypt, cookie httpOnly, bloqueio por tentativas, webhooks assinados e sessões que caem ao trocar a senha. " +
            "Por que não há autocadastro? Porque o sistema é interno da empresa: o acesso é por convite ou criado pelo administrador. " +
            "O sistema já está no ar? Ainda não: roda localmente e a publicação em servidor é o próximo passo.",
    },
    {
        id: "r-celular",
        reserva: true,
        quem: "Qualquer integrante",
        texto: "Uso no celular, se perguntarem: o quadro se adapta a telas pequenas, com as colunas rolando na horizontal.",
    },
];

