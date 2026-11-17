// Telas estáticas ("cartões") usadas entre as demonstrações: abertura, perfis, arquitetura, testes e encerramento.
const css = `
*{box-sizing:border-box;margin:0}
body{min-height:100vh;background:radial-gradient(1200px 700px at 20% 0%,#16213d 0%,#0B1020 60%);color:#EAF0FF;
  font-family:system-ui,"Segoe UI",Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:44px 72px 120px}
.brand{display:flex;align-items:center;gap:14px;font-weight:800;letter-spacing:.2px}
.logo{width:46px;height:46px;border-radius:12px;background:#4F8CFF;display:grid;place-items:center;font-size:28px;color:#0B1020}
h1{font-size:64px;line-height:1.05;margin:26px 0 14px}
h2{font-size:42px;margin-bottom:26px}
p.lead{font-size:26px;color:#B9C6E4;max-width:980px;line-height:1.4}
.tag{display:inline-block;margin-top:26px;padding:8px 16px;border:1px solid #2B3A63;border-radius:999px;color:#9FB3E0;font-size:20px;margin-right:10px}
ul{list-style:none;padding:0;display:grid;gap:16px;font-size:27px;line-height:1.3}
li::before{content:"";display:inline-block;width:12px;height:12px;border-radius:50%;background:#4F8CFF;margin-right:16px}
.cols{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.col{background:#121A31;border:1px solid #25335A;border-radius:16px;padding:24px}
.col h3{font-size:30px;margin-bottom:14px;color:#8FB4FF}
.col li{font-size:22px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:26px}
.big{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-bottom:26px}
.num{background:#121A31;border:1px solid #25335A;border-radius:16px;padding:24px;text-align:center}
.num b{display:block;font-size:84px;color:#4F8CFF;line-height:1}
.num span{font-size:22px;color:#B9C6E4}
.ok h3{color:#59D185}.no h3{color:#FFB020}
img.fig{max-width:100%;max-height:480px;display:block;margin:0 auto;border-radius:12px;background:#fff}
.phone{width:374px;height:690px;border:10px solid #232B45;border-radius:42px;background:#fff;overflow:hidden;margin:0 auto;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.phone iframe{width:354px;height:670px;border:0;display:block;zoom:1}
small{color:#8393BB;font-size:18px}
`;

const brand = `<div class="brand"><div class="logo">T</div><span style="font-size:30px">Trilho</span></div>`;

const cards = {
    intro: () => `${brand}
<h1>Gestão de tarefas e times<br>de desenvolvimento</h1>
<p class="lead">Quadro Kanban por time, dashboard consolidado, priorização assistida e integração com GitHub e GitLab.</p>
<div><span class="tag">Projeto de Extensão · ADS · USCS</span><span class="tag">Cliente: Nexus Advanced Analytics</span></div>
<p style="margin-top:24px"><small>Ana Luiza · Arthur Rodrigues · Giovanna Tamos · Raphael Carneiro · Vitor Medina</small></p>`,

    problema: () => `<h2>O problema e a solução</h2>
<div class="two"><div class="col"><h3>Na Nexus</h3><ul>
<li>Pouca visão consolidada entre os times</li><li>Prioridades técnicas sem critério claro</li><li>Planejamento separado do código-fonte</li></ul></div>
<div class="col"><h3>No Trilho</h3><ul>
<li>Quadro Kanban por time e dashboard geral</li><li>Prioridade sugerida a partir do prazo</li><li>Commits e pull requests movem as tarefas</li></ul></div></div>`,

    perfis: () => `<h2>Três perfis de acesso</h2>
<div class="cols">
<div class="col"><h3>Membro</h3><ul><li>Vê os times de que participa</li><li>Cria e move tarefas</li><li>Comenta e usa subtarefas</li></ul></div>
<div class="col"><h3>Líder de time</h3><ul><li>Tudo do membro</li><li>Gerencia o seu time</li><li>Conecta repositórios Git</li><li>Convida membros</li></ul></div>
<div class="col"><h3>Administrador</h3><ul><li>Vê todos os times</li><li>Cria, arquiva e exclui times</li><li>Gerencia usuários e convites</li></ul></div></div>
<p style="margin-top:22px"><small>Não há autocadastro: o acesso é por convite ou por conta criada pelo administrador.</small></p>`,

    arquitetura: () => `<h2 style="margin-bottom:14px">Por dentro: arquitetura</h2>
<div class="two" style="grid-template-columns:auto 1fr;gap:44px;align-items:center">
<img class="fig" style="max-height:500px" src="/__asset/24-arquitetura-camadas.png" alt="Arquitetura em camadas do Trilho">
<ul style="font-size:25px"><li><b>Front:</b> Next.js 16 e React 19, só o servidor fala com a API</li>
<li><b>API:</b> .NET 8, controladores e políticas de acesso</li><li><b>Aplicação:</b> casos de uso</li>
<li><b>Domínio:</b> entidades, regras e interfaces</li><li><b>Infraestrutura:</b> EF Core, e-mail, jobs e Git</li>
<li><b>Banco:</b> MySQL 8</li></ul></div>`,

    er: () => `<h2 style="margin-bottom:14px">Modelo de dados: 12 tabelas, MySQL 8</h2>
<img class="fig" src="/__asset/25-der.png" alt="Diagrama entidade-relacionamento">`,

    qualidade: (q) => `<h2>Qualidade e segurança</h2>
<div class="big">
<div class="num"><b>${q.get("back") ?? "167"}</b><span>testes automatizados do backend</span></div>
<div class="num"><b>${q.get("unit") ?? "41"}</b><span>testes unitários do front</span></div>
<div class="num"><b>${q.get("e2e") ?? "39"}</b><span>testes de ponta a ponta, com acessibilidade (axe)</span></div></div>
<ul style="grid-template-columns:1fr 1fr;font-size:23px"><li>Senhas com BCrypt, sessão em cookie httpOnly</li><li>Bloqueio após 5 senhas erradas</li>
<li>Webhooks validados por assinatura HMAC</li><li>Trocar a senha encerra as outras sessões</li></ul>`,

    celular: (q) => `<div class="two" style="align-items:center"><div><h2>Também no celular</h2><p class="lead">O quadro se adapta a telas pequenas, com colunas roláveis.</p></div>
<div class="phone"><iframe src="${q.get("src") ?? "/kanban"}"></iframe></div></div>`,

    encerramento: () => `<h2>O que está pronto e o que falta</h2>
<div class="two"><div class="col ok"><h3>Pronto</h3><ul><li>Sistema completo rodando localmente</li><li>Kanban, times, usuários, convites, Git e dashboard</li><li>Testes automatizados e acessibilidade</li></ul></div>
<div class="col no"><h3>Próximos passos</h3><ul><li>Colocar no ar em um servidor</li><li>Testar o envio real de e-mails (SMTP)</li><li>Validar o webhook com um repositório real</li></ul></div></div>
<p style="margin-top:22px"><small>Obrigado!</small></p>`,
};

export function cardHtml(name, query) {
    const body = (cards[name] ?? (() => `<h2>${name}</h2>`))(query);
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${name}</title><style>${css}</style></head><body>${body}</body></html>`;
}
