// Roteiro dos vídeos do Trilho. Cada passo tem a fala (legenda) por versão e a ação que acontece na tela enquanto a voz fala.
// Fala ausente em uma versão = o passo é pulado nela (curto ~3 min, medio ~6 min, longo ~10 min).
import fs from "node:fs";
import { sleep } from "./lib.mjs";

export const PASSWORD = "Nexus@2026";
const mail = (nome) => `${nome}@nexusanalytics.example`;
const BLOQUEIO = { curto: "marina.costa", medio: "lucas.prado", longo: "felipe.nunes" };
const v = (curto, medio, longo) => ({ curto, medio, longo });

async function holdOpen(r, open, close = "Escape") {
    await open();
    await r.page.getByRole("dialog").waitFor();
    await sleep(2200);
    await r.page.keyboard.press(close);
    await sleep(500);
}

export const scenes = [
    // ------------------------------------------------------------------ abertura
    {
        id: "abertura",
        steps: [
            {
                id: "intro",
                say: v(
                    "Este é o Trilho, uma plataforma web para equipes de desenvolvimento organizarem tarefas em um quadro Kanban, acompanharem prazos e ligarem o trabalho ao código. Ele foi desenvolvido como projeto de extensão para a Nexus Advanced Analytics.",
                    "Este é o Trilho, uma plataforma web para equipes de desenvolvimento organizarem tarefas em um quadro Kanban, acompanharem prazos e ligarem o trabalho ao código. Ele foi desenvolvido como projeto de extensão para a Nexus Advanced Analytics. Vou mostrar o sistema funcionando e como ele foi construído.",
                    "Este é o Trilho, uma plataforma web para equipes de desenvolvimento organizarem tarefas em um quadro Kanban, acompanharem prazos e ligarem o trabalho ao código. Ele foi desenvolvido como projeto de extensão para a Nexus Advanced Analytics. Neste vídeo vou percorrer os três perfis de acesso, as principais telas, os fluxos de segurança e a arquitetura, e dizer com clareza o que está pronto e o que ainda falta.",
                ),
                do: (r) => r.card("intro"),
            },
            {
                id: "problema",
                say: v(
                    null,
                    "A Nexus precisava coordenar melhor os seus times e dar critério às prioridades, ligando o planejamento ao código. O Trilho responde com um quadro por time, um dashboard consolidado, prioridade sugerida pelo prazo e integração com GitHub e GitLab.",
                    "A Nexus precisava melhorar a coordenação entre os seus times, organizar a gestão de tarefas e dar critério às prioridades técnicas, ligando o planejamento ao código-fonte. O Trilho responde com um quadro por time, um dashboard consolidado, prioridade sugerida pelo prazo e integração com GitHub e GitLab, tudo numa única ferramenta.",
                ),
                do: (r) => r.card("problema"),
            },
            {
                id: "perfis",
                say: v(
                    "Há três perfis: membro, líder de time e administrador. Não existe autocadastro: o acesso é por convite.",
                    "O sistema tem três perfis de acesso. O membro trabalha nas tarefas do seu time. O líder também gerencia o time, convida membros e conecta repositórios. O administrador enxerga todos os times e gerencia usuários. Não existe autocadastro: o acesso é por convite ou por uma conta criada pelo administrador.",
                    "O sistema tem três perfis de acesso. O membro trabalha nas tarefas do seu time. O líder também gerencia o time, convida membros e conecta repositórios. O administrador enxerga todos os times e gerencia usuários. Não existe autocadastro: o acesso é por convite ou por uma conta criada pelo administrador. A interface esconde o que cada perfil não pode fazer, mas é o servidor que confere a permissão em cada requisição.",
                ),
                do: (r) => r.card("perfis"),
            },
        ],
    },

    // ------------------------------------------------------------------ login e segurança
    {
        id: "login",
        steps: [
            {
                id: "login",
                say: v(
                    "A tela de login pede e-mail e senha. As senhas são guardadas com BCrypt, e a sessão fica em um cookie que o navegador não consegue ler por script.",
                    "A tela de login pede e-mail e senha. As senhas são guardadas com BCrypt, e a sessão fica em um cookie que o navegador não consegue ler por script. Depois de cinco senhas erradas seguidas, a conta é bloqueada por quinze minutos.",
                    "A tela de login pede e-mail e senha. As senhas são guardadas com BCrypt, e a sessão fica em um cookie que o navegador não consegue ler por script. Depois de cinco senhas erradas seguidas, a conta é bloqueada por quinze minutos. Vou mostrar isso agora.",
                ),
                do: async (r) => {
                    await r.goto("/login");
                    await sleep(1500);
                },
            },
            {
                id: "bloqueio",
                say: v(
                    null,
                    "Aqui, cinco tentativas erradas. Na sexta, mesmo com a senha certa, o acesso é recusado com a mensagem de bloqueio.",
                    "Aqui, cinco tentativas erradas. Na sexta, mesmo com a senha certa, o acesso é recusado com a mensagem de bloqueio. Redefinir a senha também desbloqueia a conta.",
                ),
                do: async (r) => {
                    const email = mail(BLOQUEIO[r.variant]);
                    const form = r.page;
                    for (let tentativa = 0; tentativa < 5; tentativa += 1) {
                        await r.goto("/login", { settle: 150 });
                        await r.type(form.getByLabel("E-mail corporativo"), email, { delay: 6 });
                        await r.type(form.getByLabel("Senha", { exact: true }), "Errada@1234", { delay: 6 });
                        await r.click(form.getByRole("button", { name: "Entrar" }));
                        await sleep(450);
                    }
                    await r.goto("/login", { settle: 150 });
                    await r.type(form.getByLabel("E-mail corporativo"), email, { delay: 6 });
                    await r.type(form.getByLabel("Senha", { exact: true }), PASSWORD, { delay: 6 });
                    await r.click(form.getByRole("button", { name: "Entrar" }));
                    await form.getByText(/Muitas tentativas/i).waitFor({ timeout: 15000 });
                    await sleep(1500);
                },
            },
            {
                id: "reset",
                say: v(
                    null,
                    null,
                    "Quem esquece a senha informa o e-mail e recebe um código de seis dígitos, válido por quinze minutos e de uso único. Neste ambiente de desenvolvimento o e-mail é gravado no log; em produção ele sai por SMTP. Só depois de confirmar o código é possível definir a nova senha.",
                ),
                do: async (r) => {
                    const page = r.page;
                    const email = mail("ana.lourenco");
                    await r.goto("/reset-password", { settle: 300 });
                    await r.type(page.getByLabel("E-mail cadastrado"), email);
                    await r.click(page.getByRole("button", { name: "Enviar código" }));
                    await page.waitForURL(/verify-code/);
                    await sleep(1500);
                    const log = process.env.API_LOG;
                    if (log && fs.existsSync(log)) {
                        const text = fs.readFileSync(log, "utf8");
                        const code = text.slice(text.lastIndexOf(`para ${email}`)).match(/\b(\d{6})\b/)?.[1];
                        if (code) {
                            await r.click(page.locator('input[aria-label="Dígito 1 do código"]'));
                            await page.keyboard.type(code, { delay: 150 });
                            await r.click(page.getByRole("button", { name: /verificar|continuar|confirmar/i }).first());
                            await page.waitForURL(/new-password/, { timeout: 15000 }).catch(() => {});
                        }
                    }
                    await sleep(2200);
                },
            },
            {
                id: "entrar-admin",
                say: v("Vou entrar como administradora.", "Vou entrar como administradora.", "Vou entrar como administradora."),
                do: (r) => r.login(mail("camila.duarte"), PASSWORD),
            },
        ],
    },

    // ------------------------------------------------------------------ administrador
    {
        id: "admin",
        steps: [
            {
                id: "dashboard",
                say: v(
                    "O dashboard consolida todos os times: o sprint em andamento, as tarefas atrasadas e a carga de trabalho de cada time, com alerta de sobrecarga.",
                    "O dashboard consolida todos os times: o sprint em andamento, as tarefas atrasadas e a carga de trabalho de cada time, com alerta de sobrecarga. A administradora vê todos os times; líderes e membros veem só o que é deles.",
                    "O dashboard consolida todos os times: o sprint em andamento, as tarefas atrasadas e a carga de trabalho de cada time, com alerta de sobrecarga. A administradora vê todos os times; líderes e membros veem só o que é deles. É a visão que faltava para decidir onde reforçar a equipe.",
                ),
                do: async (r) => {
                    await r.goto("/dashboard", { settle: 1200 });
                    await r.scroll(420);
                    await sleep(1500);
                    await r.scroll(-420);
                },
            },
            {
                id: "sino",
                say: v(
                    null,
                    "O sino traz avisos de prazo próximo, de tarefas atribuídas a você e de mudanças de status, inclusive as feitas automaticamente pelo Git.",
                    "O sino traz avisos de prazo próximo, de tarefas atribuídas a você e de mudanças de status, inclusive as feitas automaticamente pelo Git. Os avisos podem ser marcados como lidos.",
                ),
                do: async (r) => {
                    await r.click(r.page.getByRole("button", { name: /Notificações/ }));
                    await sleep(2800);
                    await r.page.keyboard.press("Escape");
                },
            },
            {
                id: "times",
                say: v(
                    "Em Times, a administradora vê todos os times com a carga de cada um, e pelo botão Gerenciar troca membros e líder.",
                    "Em Times aparecem todos os times com a sua carga de trabalho. Só o administrador cria, arquiva e exclui times.",
                    "Em Times aparecem todos os times com a sua carga de trabalho. Só o administrador cria, arquiva e exclui times; o líder gerencia apenas o seu.",
                ),
                do: async (r) => {
                    await r.goto("/times", { settle: 1200 });
                    if (r.variant === "curto") {
                        await holdOpen(r, () => r.click(r.page.getByRole("button", { name: "Gerenciar o time Backend" })));
                    }
                },
            },
            {
                id: "gerenciar",
                say: v(
                    null,
                    "Pelo botão Gerenciar, edita-se o nome e a descrição, adicionam-se e removem-se membros e troca-se o líder. O líder não pode ser removido sem antes passar a liderança a outra pessoa.",
                    "Pelo botão Gerenciar, edita-se o nome e a descrição, adicionam-se e removem-se membros e troca-se o líder. O líder não pode ser removido sem antes passar a liderança a outra pessoa. Um time com tarefas não pode ser excluído, apenas arquivado, e pode ser restaurado depois.",
                ),
                do: (r) => holdOpen(r, () => r.click(r.page.getByRole("button", { name: "Gerenciar o time Backend" }))),
            },
            {
                id: "git",
                say: v(
                    "Em Integrações Git, líderes e administradores conectam repositórios do GitHub ou do GitLab. O sistema gera a URL do webhook e um segredo, mostrado uma única vez e guardado cifrado.",
                    "Em Integrações Git, líderes e administradores conectam repositórios do GitHub ou do GitLab. O sistema gera a URL do webhook e um segredo, mostrado uma única vez e guardado cifrado.",
                    "Em Integrações Git, líderes e administradores conectam repositórios do GitHub ou do GitLab. O sistema gera a URL do webhook e um segredo, mostrado uma única vez e guardado cifrado. Cada repositório fica ligado a um time.",
                ),
                do: async (r) => {
                    await r.goto("/integracoes-git", { settle: 1000 });
                    await holdOpen(r, () => r.click(r.page.getByRole("button", { name: "Conectar repositório" })));
                },
            },
            {
                id: "git-vinculo",
                say: v(
                    "Para ligar o código a uma tarefa basta citar o número dela na branch, no commit ou no pull request. O card mostra o vínculo, abrir o pull request move a tarefa para Em Revisão e mesclar a leva para Concluído.",
                    "Para ligar o código a uma tarefa, basta citar o número dela no nome da branch, no commit ou no pull request, como task-6 ou #6. O card passa a mostrar a branch e o pull request. Ao abrir o pull request a tarefa vai para Em Revisão e, ao mesclar, para Concluído, a menos que existam subtarefas pendentes.",
                    "Para ligar o código a uma tarefa, basta citar o número dela no nome da branch, no commit ou no pull request, como task-6 ou #6. O card passa a mostrar a branch e o pull request. Ao abrir o pull request a tarefa vai para Em Revisão e, ao mesclar, para Concluído, a menos que existam subtarefas pendentes. Cada evento é validado pela assinatura HMAC do provedor e, se falhar, fica numa fila para nova tentativa. Isso foi validado com eventos simulados; o teste com um repositório real ainda está pendente.",
                ),
                do: async (r) => {
                    await r.goto("/kanban/6", { settle: 1200 });
                    await r.scroll(380);
                    await sleep(1800);
                    await r.scroll(-380);
                },
            },
            {
                id: "usuarios",
                say: v(
                    null,
                    "Em Configurações, o administrador gerencia os usuários: convida por e-mail, cria com senha inicial, muda o perfil e desativa ou exclui. Quem lidera um time não pode ser desativado nem excluído.",
                    "Em Configurações, o administrador gerencia os usuários: convida por e-mail, cria com senha inicial, muda o perfil e desativa ou exclui. Quem lidera um time não pode ser desativado nem excluído. O convite gera um link de ativação válido por sete dias, e a pessoa define a própria senha.",
                ),
                do: async (r) => {
                    await r.goto("/configuracoes", { settle: 800 });
                    await r.page.locator("tbody tr").first().waitFor();
                    await sleep(1200);
                    await r.click(r.page.getByRole("button", { name: "Convidar usuário" }));
                    const dialog = r.page.getByRole("dialog");
                    await dialog.waitFor();
                    await r.type(dialog.getByLabel("Nome completo"), "Rafael Teixeira", { delay: 55 });
                    await r.type(dialog.getByLabel("E-mail"), "rafael.teixeira@nexusanalytics.example", { delay: 45 });
                    await sleep(1500);
                    await r.page.keyboard.press("Escape");
                },
            },
        ],
    },

    // ------------------------------------------------------------------ líder
    {
        id: "lider",
        steps: [
            {
                id: "entrar-lider",
                say: v("Agora, como líder do time Backend.", "Agora, como líder do time Backend.", "Agora, como líder do time Backend."),
                do: async (r) => {
                    await r.logout();
                    await r.login(mail("ana.lourenco"), PASSWORD);
                },
            },
            {
                id: "kanban",
                say: v(
                    "Este é o quadro Kanban do time, com cinco colunas: Backlog, A Fazer, Em Andamento, Em Revisão e Concluído. Cada card mostra prioridade, responsável e prazo, e os atrasados ficam destacados.",
                    "Este é o quadro Kanban do time, com cinco colunas: Backlog, A Fazer, Em Andamento, Em Revisão e Concluído. Cada card mostra prioridade, responsável e prazo, e os atrasados ficam destacados. Quem participa de mais de um time escolhe o quadro pelas abas no topo.",
                    "Este é o quadro Kanban do time, com cinco colunas: Backlog, A Fazer, Em Andamento, Em Revisão e Concluído. Cada card mostra prioridade, responsável e prazo, e os atrasados ficam destacados. Quem participa de mais de um time escolhe o quadro pelas abas no topo, e cada time tem o seu próprio quadro.",
                ),
                do: async (r) => {
                    await r.goto("/kanban", { settle: 500 });
                    await r.waitBoard();
                    await sleep(2500);
                },
            },
            {
                id: "arrastar",
                say: v(
                    "Para mudar o status, basta arrastar o card. Se o servidor recusar, por exemplo ao concluir uma tarefa com subtarefas pendentes, o card volta para onde estava e o motivo aparece na tela.",
                    "Para mudar o status, basta arrastar o card. A mudança aparece na hora. Se o servidor recusar, por exemplo ao concluir uma tarefa com subtarefas pendentes, o card volta para onde estava e o motivo aparece na tela.",
                    "Para mudar o status, basta arrastar o card. A mudança aparece na hora e é confirmada no servidor. Se o servidor recusar, por exemplo ao concluir uma tarefa com subtarefas pendentes, o card volta para onde estava e o motivo aparece na tela.",
                ),
                do: async (r) => {
                    const card = r.column("Backlog").locator('a[href^="/kanban/"]').first();
                    await r.drag(card, r.column("A Fazer"));
                    await sleep(1500);
                    const moved = r.column("A Fazer").locator('a[href^="/kanban/"]').last();
                    await r.drag(moved, r.column("Backlog"));
                },
            },
            {
                id: "filtros",
                say: v(
                    null,
                    "A barra de filtros busca por título e filtra por responsável e prioridade. Com filtro ativo, o arrasto fica desligado.",
                    "A barra de filtros busca por título e filtra por responsável e prioridade. Enquanto há filtro ativo o arrasto fica desligado, para ninguém reordenar um quadro com cards escondidos. Um clique em Limpar filtros devolve o quadro inteiro.",
                ),
                do: async (r) => {
                    const page = r.page;
                    await r.select(page.getByLabel("Filtrar por prioridade"), "high");
                    await sleep(1200);
                    await r.type(page.getByLabel("Buscar tarefa por título"), "a", { delay: 80 });
                    await sleep(2000);
                    await r.click(page.getByRole("button", { name: "Limpar filtros" }));
                },
            },
            {
                id: "detalhe",
                say: v(
                    "No detalhe da tarefa há descrição, subtarefas, comentários e o histórico de tudo o que mudou.",
                    "No detalhe da tarefa há descrição, subtarefas, comentários e o histórico de tudo o que mudou. Dá para editar os campos, marcar subtarefas como feitas e comentar.",
                    "No detalhe da tarefa há descrição, subtarefas, comentários e o histórico de tudo o que mudou. Dá para editar os campos, marcar subtarefas como feitas e comentar. Um líder pode excluir a tarefa, desde que não restem subtarefas pendentes, e cada alteração fica registrada no histórico com autor e data.",
                ),
                do: async (r) => {
                    await r.goto("/kanban/4", { settle: 1200 });
                    await r.scroll(420);
                    await sleep(2000);
                    await r.scroll(-420);
                },
            },
            {
                id: "comentar",
                say: v(
                    null,
                    null,
                    "Vou deixar um comentário nesta tarefa. Ele aparece na hora, com autor e horário, e também entra no histórico.",
                ),
                do: async (r) => {
                    await r.goto("/kanban/4", { settle: 1000 });
                    await r.scroll(300);
                    const campo = r.page.getByPlaceholder(/Escreva um comentário/i);
                    await r.type(campo, "Vou revisar a divisão em subtarefas ainda hoje.", { delay: 45 });
                    await r.click(r.page.getByRole("button", { name: "Comentar" }));
                    await sleep(2200);
                },
            },
            {
                id: "nova",
                say: v(
                    "Ao criar uma tarefa, o sistema já sugere a prioridade a partir do prazo.",
                    "Nova tarefa pede título, descrição, responsável, prazo e prioridade, e já sugere a prioridade a partir do prazo informado.",
                    "Nova tarefa pede título, descrição, responsável, prazo e prioridade, e já sugere a prioridade a partir do prazo informado. O responsável pode ser uma pessoa ou o time inteiro.",
                ),
                do: async (r) => {
                    await r.goto("/kanban", { settle: 500 });
                    await r.waitBoard();
                    await r.click(r.page.getByRole("button", { name: "Nova tarefa" }));
                    const dialog = r.page.getByRole("dialog");
                    await dialog.waitFor();
                    await r.type(dialog.getByLabel("Título"), "Implementar cache das consultas do quadro", { delay: 40 });
                    await r.type(dialog.getByLabel("Descrição"), "Reduzir o tempo de carregamento do Kanban para menos de 2 segundos.", { delay: 25 });
                    await sleep(1500);
                    if (r.variant !== "longo") await r.page.keyboard.press("Escape");
                },
            },
            {
                id: "criada",
                say: v(
                    null,
                    null,
                    "Ao salvar, a tarefa entra no Backlog e todo o time a vê no quadro. Se houver um responsável, ele recebe um aviso no sino, e a criação fica registrada no histórico da tarefa.",
                ),
                do: async (r) => {
                    await r.click(r.page.getByRole("button", { name: "Criar Tarefa" }));
                    await r.page.getByRole("dialog").waitFor({ state: "hidden", timeout: 15000 });
                    await sleep(1200);
                    const novo = r.page.getByRole("link", { name: "Implementar cache das consultas do quadro" }).first();
                    await novo.waitFor({ timeout: 15000 });
                    await r.move(novo);
                    await r.spot(novo, 2200);
                },
            },
            {
                id: "priorizacao",
                say: v(
                    "A tela de priorização lista as tarefas abertas ordenadas por urgência e explica o motivo de cada sugestão. O líder decide se aplica.",
                    "A tela de priorização lista as tarefas abertas ordenadas por urgência e explica o motivo de cada sugestão. A regra usa o prazo: vencida é urgente, até sete dias é alta, até vinte e um é média, e depois disso é baixa. O líder decide se aplica.",
                    "A tela de priorização lista as tarefas abertas ordenadas por urgência e explica o motivo de cada sugestão. A regra usa o prazo: vencida é urgente, até sete dias é alta, até vinte e um é média, e depois disso é baixa. O líder decide se aplica. Hoje o motor é baseado em regras, mas ele fica atrás de uma interface e pode ser trocado por um modelo de inteligência artificial.",
                ),
                do: async (r) => {
                    await r.goto("/tarefas", { settle: 1200 });
                    await r.scroll(360);
                    await sleep(1800);
                    await r.scroll(-360);
                },
            },
        ],
    },

    // ------------------------------------------------------------------ membro
    {
        id: "membro",
        steps: [
            {
                id: "entrar-membro",
                say: v("Por fim, como membro.", "Por fim, como membro.", "Por fim, como membro."),
                do: async (r) => {
                    await r.logout();
                    await r.login(mail("vitor.medina"), PASSWORD);
                },
            },
            {
                id: "membro",
                say: v(
                    null,
                    "O membro vê só os times de que participa e não tem as telas de administração no menu. Mesmo que alguém digite o endereço de uma tela proibida, o servidor confere a permissão e recusa.",
                    "O membro vê só os times de que participa e não tem as telas de administração no menu. Mesmo que alguém digite o endereço de uma tela proibida, o servidor confere a permissão e recusa. Essa matriz de permissões por perfil é verificada por testes automatizados.",
                ),
                do: async (r) => {
                    await r.goto("/kanban", { settle: 500 });
                    await r.waitBoard();
                    await sleep(1500);
                    await r.spot(r.page.locator("aside, nav").first(), 2500);
                },
            },
            {
                id: "senha",
                say: v(
                    null,
                    "Em Configurações, ele altera os próprios dados e a senha. Trocar a senha encerra as outras sessões abertas da conta, para o caso de a senha ter vazado.",
                    "Em Configurações, ele altera os próprios dados e a senha, informando a senha atual. Trocar a senha encerra as outras sessões abertas da conta, para o caso de a senha ter vazado.",
                ),
                do: async (r) => {
                    await r.goto("/configuracoes", { settle: 800 });
                    await r.page.getByText("Meu perfil").waitFor();
                    await r.type(r.page.getByLabel("Senha atual"), "senha-atual", { delay: 55 });
                    await r.type(r.page.getByLabel("Nova senha", { exact: true }), "Nova@Senha2026", { delay: 55 });
                    await sleep(1500);
                },
            },
            {
                id: "celular",
                say: v(
                    null,
                    "O layout se adapta ao celular, com colunas roláveis no quadro.",
                    "O layout se adapta ao celular: o quadro vira colunas roláveis, e as telas continuam utilizáveis em telas pequenas.",
                ),
                do: async (r) => {
                    await r.card("celular", "?src=/kanban");
                    await sleep(3500);
                },
            },
        ],
    },

    // ------------------------------------------------------------------ por dentro
    {
        id: "dentro",
        steps: [
            {
                id: "arquitetura",
                say: v(
                    "Por dentro, o backend é uma API .NET 8 organizada em camadas, o front é Next.js, e o banco é MySQL.",
                    "Por dentro, o backend é uma API .NET 8 em camadas: API, Aplicação com os casos de uso, Domínio com as regras e Infraestrutura, que implementa banco, e-mail, rotinas e integração Git. O front, em Next.js 16, fala com a API só pelo servidor, então o token nunca chega ao navegador.",
                    "Por dentro, o backend é uma API .NET 8 em camadas: a de API recebe as requisições, a de Aplicação concentra os casos de uso, o Domínio guarda as regras e as interfaces, e a Infraestrutura implementa banco, e-mail, tarefas em segundo plano e integração Git. O front, em Next.js 16, fala com a API só pelo servidor, então o token nunca chega ao navegador. O acesso ao banco usa Entity Framework Core, e há rotinas em segundo plano para avisos de prazo, nova tentativa de eventos Git e retenção de dados.",
                ),
                do: async (r) => {
                    await r.card("arquitetura");
                    await sleep(1500);
                },
            },
            {
                id: "er",
                say: v(
                    null,
                    "O banco MySQL tem doze tabelas, entre elas usuários, times, tarefas, subtarefas, comentários, histórico, notificações, convites, redefinições de senha e repositórios Git. As migrações são aplicadas pela própria API ao iniciar.",
                    "O banco MySQL tem doze tabelas: usuários, times e participações, tarefas, subtarefas, comentários, histórico de atividades, notificações, convites, pedidos de redefinição de senha, repositórios Git e a fila de eventos Git pendentes. As migrações são aplicadas pela própria API ao iniciar, e há um dicionário de dados completo na documentação do projeto.",
                ),
                do: (r) => r.card("er"),
            },
            {
                id: "qualidade",
                say: v(
                    "A qualidade é verificada por testes automatizados: 253 no backend, 41 unitários e 39 de ponta a ponta no front, incluindo auditoria de acessibilidade.",
                    "A qualidade é verificada por testes automatizados: 253 no backend, 41 unitários e 39 de ponta a ponta no front, incluindo auditoria de acessibilidade com axe. Há fluxos de integração contínua no GitHub Actions para o backend e para o front.",
                    "A qualidade é verificada por testes automatizados: 253 no backend, 41 unitários e 39 de ponta a ponta no front, incluindo auditoria de acessibilidade com axe. Há fluxos de integração contínua no GitHub Actions para o backend e para o front. Na segurança, os webhooks são validados por assinatura HMAC, há limite de tentativas de login, bloqueio de conta e invalidação de sessões ao trocar a senha, e os segredos ficam fora do repositório.",
                ),
                do: async (r) => {
                    await r.card("qualidade");
                    await sleep(1500);
                },
            },
            {
                id: "fim",
                say: v(
                    "O sistema está completo e funciona localmente. Falta colocá-lo no ar, testar o envio real de e-mails e validar o webhook com um repositório real.",
                    "O sistema está completo e funciona localmente. Falta colocá-lo no ar em um servidor, testar o envio real de e-mails por SMTP e validar o webhook com um repositório real do GitHub. Obrigado!",
                    "O sistema está completo e funciona localmente. Falta colocá-lo no ar em um servidor, testar o envio real de e-mails por SMTP e validar o webhook com um repositório real do GitHub. Esses passos já estão planejados, e o código está no repositório do projeto no GitHub. Obrigado!",
                ),
                do: async (r) => {
                    await r.card("encerramento");
                    await sleep(1500);
                },
            },
        ],
    },
];

/** Passos de uma versão, na ordem, com a fala escolhida. */
export function stepsFor(variant) {
    return scenes.flatMap((scene) => scene.steps.map((step) => ({ ...step, scene: scene.id, text: step.say[variant] ?? null })));
}
