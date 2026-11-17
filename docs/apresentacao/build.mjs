// Gera os slides da apresentação final do Trilho (7 min + 3 min de perguntas).
// Uso: node build.mjs   (saída em saida/: Trilho-Apresentacao.pptx e roteiro-fala.md)
// Requer a skill "pptx" só para gravar as cores do tema no arquivo (applyTheme): defina PPTX_SKILL_DIR se o caminho for outro.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import pptxgen from "pptxgenjs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import * as fa from "react-icons/fa";
import { falas } from "./falas.mjs";

const require = createRequire(import.meta.url);
const DIR = path.dirname(fileURLToPath(import.meta.url));
const FIG = path.resolve(DIR, "..", "relatorio", "figuras");
const OUT = path.join(DIR, "saida");
fs.mkdirSync(OUT, { recursive: true });

const SKILL_DIR =
    process.env.PPTX_SKILL_DIR ??
    "C:/Users/Vitor Medina/AppData/Local/Claude-Data/claude_pzs8sxrjxfjjc/local-agent-mode-sessions/skills-plugin/ed282860-e1cc-48b2-8aa2-259d9847c77e/ae647b67-8d6d-44f0-bc5c-7db38cb6c4eb/skills/pptx";
const { applyTheme } = require(path.join(SKILL_DIR, "scripts", "apply_theme.js"));

// ---------------------------------------------------------------- tema
const THEME = {
    name: "Trilho",
    headFontFace: "Cambria",
    bodyFontFace: "Calibri",
    colors: {
        dk1: "0B1020", lt1: "FFFFFF", dk2: "121A31", lt2: "EEF3FF",
        accent1: "2563EB", accent2: "59D185", accent3: "FFB020", accent4: "22D3EE", accent5: "FF6B6B", accent6: "8FB4FF",
        hlink: "2563EB", folHlink: "5B6B91",
    },
};
const MUTED = "5B6B91"; // texto secundário em fundo claro

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Trilho — apresentação final";
pres.author = "Grupo Trilho (USCS)";
pres.subject = "Projeto de Extensão ADS";
const C = pres.SchemeColor;
const W = 13.333;

// ---------------------------------------------------------------- layouts
const footer = [
    { text: { text: "Trilho · Projeto de Extensão · ADS · USCS", options: { x: 0.6, y: 7.0, w: 6, h: 0.3, fontSize: 11, color: MUTED, margin: 0, isTextBox: true } } },
];
pres.defineSlideMaster({
    title: "Capa",
    background: { color: THEME.colors.dk1 },
    objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.7, y: 1.95, w: 6.4, h: 2.3, fontSize: 40, bold: true, color: C.background1, margin: 0, align: "left", valign: "top" }, text: "" } }],
});
pres.defineSlideMaster({
    title: "Titulo",
    background: { color: THEME.colors.lt1 },
    objects: [
        { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 12.1, h: 0.85, fontSize: 36, bold: true, color: C.text1, margin: 0, align: "left", valign: "middle" }, text: "" } },
        ...footer,
    ],
    slideNumber: { x: 12.1, y: 7.0, w: 0.65, h: 0.3, fontSize: 11, color: MUTED, align: "right" },
});
pres.defineSlideMaster({
    title: "Fecho",
    background: { color: THEME.colors.dk1 },
    objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 12.1, h: 0.85, fontSize: 36, bold: true, color: C.background1, margin: 0, align: "left", valign: "middle" }, text: "" } }],
});

// ---------------------------------------------------------------- utilidades
const SIZES = {
    "06-dashboard": [1280, 520], "07-kanban": [1600, 440], "16-priorizacao": [1280, 900], "17-integracoes-git": [1280, 800],
    "11-detalhe-tarefa-git": [1280, 920], "20-convidar-usuario": [608, 480], "05-bloqueio-conta": [528, 490], "25-der": [2814, 2494],
    "23-kanban-celular": [780, 1480],
};
const shadow = () => ({ type: "outer", color: "0B1020", opacity: 0.2, blur: 8, offset: 2, angle: 90 });

/** Imagem dentro de uma moldura escura arredondada, ajustada a maxW x maxH a partir de (x, y). Devolve a caixa ocupada. */
function frame(slide, name, x, y, maxW, maxH, alt) {
    const [iw, ih] = SIZES[name];
    const scale = Math.min(maxW / iw, maxH / ih);
    const w = iw * scale, h = ih * scale, pad = 0.06;
    slide.addShape(pres.ShapeType.roundRect, { x: x - pad, y: y - pad, w: w + 2 * pad, h: h + 2 * pad, fill: { color: C.text2 }, line: { color: C.text2 }, rectRadius: 0.1, shadow: shadow(), objectName: `Moldura ${name}` });
    slide.addImage({ path: path.join(FIG, `${name}.png`), x, y, w, h, altText: alt, objectName: name });
    return { x, y, w, h };
}

async function iconPng(name, hex) {
    const svg = renderToStaticMarkup(React.createElement(fa[name], { color: `#${hex}`, size: 256 }));
    const buf = await sharp(Buffer.from(svg)).resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    return `image/png;base64,${buf.toString("base64")}`;
}
const iconCache = new Map();
async function icon(name, hex) {
    const key = `${name}-${hex}`;
    if (!iconCache.has(key)) iconCache.set(key, await iconPng(name, hex));
    return iconCache.get(key);
}
/** Ícone dentro de um círculo colorido, com o canto superior esquerdo em (x, y) e diâmetro d. */
async function badge(slide, name, x, y, d, fill = C.accent1, iconHex = "FFFFFF") {
    slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill }, objectName: `Círculo ${name}` });
    const s = d * 0.5;
    slide.addImage({ data: await icon(name, iconHex), x: x + (d - s) / 2, y: y + (d - s) / 2, w: s, h: s, altText: "", objectName: `Ícone ${name}` });
}
const text = (slide, content, o) => slide.addText(content, { margin: 0, isTextBox: true, valign: "top", ...o });
const bullets = (items, o = {}) =>
    items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 6, ...o } }));
function note(slide, id, cumulative) {
    const f = falas.find((item) => item.id === id);
    const words = f.texto.split(/\s+/).length;
    const secs = Math.round((words / 135) * 60);
    const mm = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    const header = f.reserva ? `[RESERVA — só se perguntarem · ${f.quem}]` : `[${f.quem} · ${mm(cumulative.t)}–${mm(cumulative.t + secs)}]`;
    if (!f.reserva) cumulative.t += secs;
    slide.addNotes(`${header}\n\n${f.texto}`);
    return { ...f, words, secs, start: f.reserva ? null : cumulative.t - secs };
}

const cum = { t: 0 };
const log = [];

// ---------------------------------------------------------------- 1. capa
pres.addSection({ title: "Apresentação (7 min)" });
{
    const s = pres.addSlide({ masterName: "Capa", sectionTitle: "Apresentação (7 min)" });
    s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 0.7, w: 0.7, h: 0.7, fill: { color: "4F8CFF" }, line: { color: "4F8CFF" }, rectRadius: 0.15, objectName: "Logo" });
    text(s, "T", { x: 0.7, y: 0.7, w: 0.7, h: 0.7, fontSize: 30, bold: true, color: C.text1, align: "center", valign: "middle", objectName: "Logo letra" });
    text(s, "Trilho", { x: 1.6, y: 0.7, w: 3, h: 0.7, fontSize: 30, bold: true, color: C.background1, valign: "middle" });
    s.addText("Gestão de tarefas e times de desenvolvimento", { placeholder: "title" });
    text(s, "Quadro Kanban por time, dashboard consolidado, priorização assistida e integração com GitHub e GitLab.", { x: 0.7, y: 4.35, w: 6.4, h: 0.9, fontSize: 18, color: C.accent6 });
    for (const [i, label] of ["Projeto de Extensão · ADS · USCS", "Cliente: Nexus Advanced Analytics"].entries()) {
        s.addShape(pres.ShapeType.roundRect, { x: 0.7, y: 5.4 + i * 0.55, w: 3.6, h: 0.42, fill: { color: C.text2 }, line: { color: C.accent6, width: 1 }, rectRadius: 0.21, objectName: `Etiqueta ${i + 1}` });
        text(s, label, { x: 0.7, y: 5.4 + i * 0.55, w: 3.6, h: 0.42, fontSize: 14, color: C.background1, align: "center", valign: "middle" });
    }
    text(s, "Ana Luiza Lourenço · Arthur Rodrigues · Giovanna Tamos · Raphael Carneiro · Vitor Medina", { x: 0.7, y: 6.75, w: 12, h: 0.35, fontSize: 14, color: C.accent6 });
    const a = frame(s, "06-dashboard", 7.5, 1.0, 5.2, 2.2, "Dashboard consolidado do Trilho");
    frame(s, "07-kanban", 7.5, a.y + a.h + 0.35, 5.2, 1.6, "Quadro Kanban do Time Backend");
    log.push(note(s, "capa", cum));
}

// ---------------------------------------------------------------- 2. problema
{
    const s = pres.addSlide({ masterName: "Titulo", sectionTitle: "Apresentação (7 min)" });
    s.addText("O problema na Nexus", { placeholder: "title" });
    const cards = [
        ["FaEye", "Sem visão consolidada", "Ninguém enxergava o andamento de todos os times ao mesmo tempo."],
        ["FaSortAmountDown", "Prioridade sem critério", "Cada pessoa decidia à sua maneira o que era mais urgente."],
        ["FaCodeBranch", "Planejamento longe do código", "O commit acontecia em um lugar e o quadro de tarefas ficava desatualizado em outro."],
    ];
    for (const [i, [ic, head, body]] of cards.entries()) {
        const x = 0.6 + i * 4.15;
        s.addShape(pres.ShapeType.roundRect, { x, y: 1.65, w: 3.85, h: 3.55, fill: { color: C.background2 }, line: { color: C.background2 }, rectRadius: 0.12, objectName: `Cartão ${i + 1}` });
        await badge(s, ic, x + 0.35, 1.95, 0.85);
        text(s, head, { x: x + 0.35, y: 3.0, w: 3.15, h: 0.9, fontSize: 24, bold: true, color: C.text1 });
        text(s, body, { x: x + 0.35, y: 4.05, w: 3.15, h: 1.05, fontSize: 16, color: C.text1 });
    }
    s.addShape(pres.ShapeType.roundRect, { x: 0.6, y: 5.55, w: 12.15, h: 1.1, fill: { color: C.text2 }, line: { color: C.text2 }, rectRadius: 0.12, objectName: "Faixa solução" });
    text(s, "O Trilho junta as três pontas: quadro Kanban, priorização assistida e integração com o Git.", { x: 1.0, y: 5.55, w: 11.4, h: 1.1, fontSize: 22, bold: true, color: C.background1, valign: "middle" });
    log.push(note(s, "problema", cum));
}

// ---------------------------------------------------------------- 3. perfis
{
    const s = pres.addSlide({ masterName: "Titulo", sectionTitle: "Apresentação (7 min)" });
    s.addText("Um sistema, três perfis de acesso", { placeholder: "title" });
    const perfis = [
        ["FaUser", "Membro", ["Vê os times de que participa", "Cria e move tarefas", "Comenta e usa subtarefas"]],
        ["FaUserTie", "Líder de time", ["Tudo do membro", "Gerencia o próprio time", "Conecta repositórios Git", "Convida membros"]],
        ["FaUserShield", "Administrador", ["Vê todos os times", "Cria, arquiva e exclui times", "Gerencia usuários e convites"]],
    ];
    for (const [i, [ic, head, items]] of perfis.entries()) {
        const x = 0.6 + i * 4.15;
        s.addShape(pres.ShapeType.roundRect, { x, y: 1.6, w: 3.85, h: 3.95, fill: { color: C.background2 }, line: { color: C.background2 }, rectRadius: 0.12, objectName: `Perfil ${head}` });
        await badge(s, ic, x + 0.35, 1.9, 0.8);
        text(s, head, { x: x + 1.35, y: 1.9, w: 2.3, h: 0.8, fontSize: 24, bold: true, color: C.text1, valign: "middle" });
        text(s, bullets(items), { x: x + 0.35, y: 3.05, w: 3.2, h: 2.4, fontSize: 20, color: C.text1 });
    }
    await badge(s, "FaLock", 0.6, 5.95, 0.7, C.text2);
    text(s, "Sem autocadastro: o acesso é por convite ou por uma conta criada pelo administrador.", { x: 1.5, y: 5.95, w: 11.2, h: 0.7, fontSize: 20, bold: true, color: C.text1, valign: "middle" });
    log.push(note(s, "perfis", cum));
}

// ---------------------------------------------------------------- 4. dashboard e kanban
{
    const s = pres.addSlide({ masterName: "Titulo", sectionTitle: "Apresentação (7 min)" });
    s.addText("Dashboard e quadro Kanban", { placeholder: "title" });
    const a = frame(s, "06-dashboard", 0.65, 1.55, 6.9, 2.8, "Dashboard consolidado com tarefas ativas, atrasadas, concluídas e carga por time");
    frame(s, "07-kanban", 0.65, a.y + a.h + 0.4, 6.9, 2.0, "Quadro Kanban do Time Backend com cinco colunas");
    const items = [
        ["FaChartBar", "Dashboard consolidado", "Tarefas ativas, atrasadas e concluídas, carga de cada time e entregas por sprint."],
        ["FaColumns", "Kanban por time", "Cinco colunas, arrastar e soltar e filtros por responsável e prioridade."],
        ["FaTags", "Etiquetas no cartão", "Prioridade sugerida, atraso e pull request ligado ficam visíveis."],
    ];
    for (const [i, [ic, head, body]] of items.entries()) {
        const y = 1.6 + i * 1.7;
        await badge(s, ic, 8.55, y, 0.7);
        text(s, head, { x: 9.45, y, w: 3.3, h: 0.7, fontSize: 20, bold: true, color: C.text1, valign: "middle" });
        text(s, body, { x: 8.55, y: y + 0.85, w: 4.2, h: 0.75, fontSize: 16, color: C.text1 });
    }
    log.push(note(s, "dashboard-kanban", cum));
}

// ---------------------------------------------------------------- 5. priorização
{
    const s = pres.addSlide({ masterName: "Titulo", sectionTitle: "Apresentação (7 min)" });
    s.addText("O sistema sugere, o líder decide", { placeholder: "title" });
    frame(s, "16-priorizacao", 0.65, 1.55, 6.9, 4.85, "Tela de sugestão de priorização com a ordem das tarefas e o motivo de cada sugestão");
    const items = [
        ["FaClock", "Prazo e carga", "A prioridade sugerida vem do prazo e do trabalho em aberto de cada pessoa."],
        ["FaUserCheck", "Responsável sugerido", "Ao criar a tarefa, o sistema indica quem tem menos trabalho."],
        ["FaBell", "Aviso de prazo", "Perto do vencimento, o responsável é notificado."],
    ];
    for (const [i, [ic, head, body]] of items.entries()) {
        const y = 1.55 + i * 1.45;
        await badge(s, ic, 8.0, y, 0.7);
        text(s, head, { x: 8.9, y, w: 3.85, h: 0.7, fontSize: 20, bold: true, color: C.text1, valign: "middle" });
        text(s, body, { x: 8.0, y: y + 0.78, w: 4.75, h: 0.6, fontSize: 16, color: C.text1 });
    }
    s.addShape(pres.ShapeType.roundRect, { x: 8.0, y: 5.95, w: 4.75, h: 0.75, fill: { color: C.text2 }, line: { color: C.text2 }, rectRadius: 0.1, objectName: "Nota regras" });
    text(s, "Hoje por regras; o motor pode ser trocado por um modelo de IA.", { x: 8.2, y: 5.95, w: 4.35, h: 0.75, fontSize: 14, bold: true, color: C.background1, valign: "middle" });
    log.push(note(s, "priorizacao", cum));
}

// ---------------------------------------------------------------- 6. git
{
    const s = pres.addSlide({ masterName: "Titulo", sectionTitle: "Apresentação (7 min)" });
    s.addText("Integração com GitHub e GitLab", { placeholder: "title" });
    frame(s, "17-integracoes-git", 1.2, 1.5, 5.6, 3.5, "Tela de integrações Git com dois repositórios conectados");
    frame(s, "11-detalhe-tarefa-git", 7.2, 1.5, 4.9, 3.5, "Tarefa ligada a uma branch e a um pull request");
    const steps = [
        "Cite #123 ou task-123 na branch, no commit ou no PR",
        "O webhook chega ao Trilho com assinatura HMAC",
        "PR aberto: a tarefa vai para Em revisão",
        "Merge: a tarefa vai para Concluído",
    ];
    for (const [i, label] of steps.entries()) {
        const x = 0.6 + i * 3.15;
        s.addShape(pres.ShapeType.roundRect, { x, y: 5.45, w: 2.7, h: 1.2, fill: { color: C.background2 }, line: { color: C.background2 }, rectRadius: 0.1, objectName: `Passo ${i + 1}` });
        text(s, [{ text: `${i + 1}  `, options: { bold: true, color: C.accent1 } }, { text: label, options: { color: C.text1 } }], { x: x + 0.15, y: 5.45, w: 2.4, h: 1.2, fontSize: 15, valign: "middle" });
        if (i < 3) s.addShape(pres.ShapeType.rightArrow, { x: x + 2.75, y: 5.9, w: 0.35, h: 0.3, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: `Seta ${i + 1}` });
    }
    log.push(note(s, "git", cum));
}

// ---------------------------------------------------------------- 7. administração e segurança
{
    const s = pres.addSlide({ masterName: "Titulo", sectionTitle: "Apresentação (7 min)" });
    s.addText("Administração e segurança", { placeholder: "title" });
    const a = frame(s, "20-convidar-usuario", 0.65, 2.36, 3.7, 3.0, "Tela para convidar um usuário por e-mail");
    const b = frame(s, "05-bloqueio-conta", 4.55, 1.85, 3.7, 3.5, "Aviso de conta bloqueada após cinco tentativas");
    text(s, "Convite por e-mail", { x: 0.65, y: b.y + b.h + 0.25, w: 3.7, h: 0.4, fontSize: 14, color: MUTED });
    text(s, "Bloqueio após 5 tentativas", { x: 4.55, y: b.y + b.h + 0.25, w: 3.7, h: 0.4, fontSize: 14, color: MUTED });

    const items = [
        ["FaEnvelopeOpenText", "Convite por e-mail", "O link ativa a conta e a pessoa define a própria senha."],
        ["FaLock", "Senha e sessão", "BCrypt e cookie httpOnly; trocar a senha encerra as outras sessões."],
        ["FaUserLock", "Bloqueio por tentativas", "Cinco senhas erradas bloqueiam a conta por 15 minutos."],
        ["FaCheckDouble", "Webhooks assinados", "Cada evento do Git é validado por assinatura HMAC."],
    ];
    for (const [i, [ic, head, body]] of items.entries()) {
        const y = 1.6 + i * 1.3;
        await badge(s, ic, 8.85, y, 0.7);
        text(s, head, { x: 9.75, y, w: 3.0, h: 0.7, fontSize: 18, bold: true, color: C.text1, valign: "middle" });
        text(s, body, { x: 9.75, y: y + 0.72, w: 3.0, h: 0.5, fontSize: 14, color: C.text1 });
    }
    log.push(note(s, "admin-seguranca", cum));
}

// ---------------------------------------------------------------- 8. arquitetura
{
    const s = pres.addSlide({ masterName: "Titulo", sectionTitle: "Apresentação (7 min)" });
    s.addText("Arquitetura em camadas", { placeholder: "title" });
    const layers = [
        ["Front-end", "Next.js 16 e React 19; só o servidor fala com a API", "2563EB"],
        ["API", ".NET 8: controladores e políticas de acesso", "1D4FD0"],
        ["Aplicação", "Casos de uso", "1A44B0"],
        ["Domínio", "Entidades, regras e interfaces", "16388F"],
        ["Infraestrutura", "EF Core, e-mail, tarefas em segundo plano e Git", "122D72"],
        ["Banco de dados", "MySQL 8", "0B1020"],
    ];
    for (const [i, [head, body, fill]] of layers.entries()) {
        const y = 1.5 + i * 0.88;
        s.addShape(pres.ShapeType.roundRect, { x: 0.6, y, w: 7.3, h: 0.76, fill: { color: fill }, line: { color: fill }, rectRadius: 0.1, objectName: `Camada ${head}` });
        text(s, [{ text: `${head}  `, options: { bold: true, fontSize: 18 } }, { text: body, options: { fontSize: 15 } }], { x: 0.85, y, w: 6.9, h: 0.76, color: C.background1, valign: "middle" });
    }
    const stats = [["11", "controladores"], ["52", "endpoints"], ["12", "tabelas"], ["3", "jobs em segundo plano"]];
    for (const [i, [n, label]] of stats.entries()) {
        const x = 8.4 + (i % 2) * 2.25, y = 1.5 + Math.floor(i / 2) * 1.7;
        s.addShape(pres.ShapeType.roundRect, { x, y, w: 2.1, h: 1.55, fill: { color: C.background2 }, line: { color: C.background2 }, rectRadius: 0.1, objectName: `Número ${label}` });
        text(s, n, { x, y: y + 0.1, w: 2.1, h: 0.85, fontSize: 44, bold: true, color: C.accent1, align: "center", valign: "middle" });
        text(s, label, { x: x + 0.1, y: y + 0.95, w: 1.9, h: 0.5, fontSize: 14, color: C.text1, align: "center" });
    }
    s.addShape(pres.ShapeType.roundRect, { x: 8.4, y: 4.95, w: 4.35, h: 1.45, fill: { color: C.text2 }, line: { color: C.text2 }, rectRadius: 0.1, objectName: "Entrega" });
    await badge(s, "FaDocker", 8.65, 5.2, 0.6, C.accent1);
    text(s, "Docker e GitHub Actions: contêineres, build e testes a cada alteração.", { x: 9.45, y: 4.95, w: 3.15, h: 1.45, fontSize: 15, bold: true, color: C.background1, valign: "middle" });
    log.push(note(s, "arquitetura", cum));
}

// ---------------------------------------------------------------- 9. qualidade
{
    const s = pres.addSlide({ masterName: "Titulo", sectionTitle: "Apresentação (7 min)" });
    s.addText("Qualidade verificada por testes", { placeholder: "title" });
    const stats = [["167", "testes automatizados do backend"], ["41", "testes unitários do front-end"], ["39", "testes de ponta a ponta, com acessibilidade (axe)"]];
    for (const [i, [n, label]] of stats.entries()) {
        const x = 0.6 + i * 4.15;
        s.addShape(pres.ShapeType.roundRect, { x, y: 1.6, w: 3.85, h: 2.9, fill: { color: C.text2 }, line: { color: C.text2 }, rectRadius: 0.12, shadow: shadow(), objectName: `Número ${n}` });
        text(s, n, { x, y: 1.8, w: 3.85, h: 1.4, fontSize: 80, bold: true, color: C.background1, align: "center", valign: "middle" });
        text(s, label, { x: x + 0.3, y: 3.25, w: 3.25, h: 1.0, fontSize: 18, color: C.accent6, align: "center" });
    }
    const items = [
        ["FaUniversalAccess", "Acessibilidade", "Verificação automática com axe em cada tela testada."],
        ["FaSyncAlt", "Integração contínua", "Build, testes e auditoria rodam a cada alteração no GitHub."],
        ["FaMobileAlt", "Responsivo", "O quadro se adapta ao celular, com colunas roláveis."],
    ];
    for (const [i, [ic, head, body]] of items.entries()) {
        const x = 0.6 + i * 4.15;
        await badge(s, ic, x, 4.95, 0.7);
        text(s, head, { x: x + 0.9, y: 4.95, w: 2.95, h: 0.7, fontSize: 20, bold: true, color: C.text1, valign: "middle" });
        text(s, body, { x, y: 5.85, w: 3.85, h: 0.8, fontSize: 16, color: C.text1 });
    }
    log.push(note(s, "qualidade", cum));
}

// ---------------------------------------------------------------- 10. fecho
{
    const s = pres.addSlide({ masterName: "Fecho", sectionTitle: "Apresentação (7 min)" });
    s.addText("O que está pronto e o que falta", { placeholder: "title" });
    const cols = [
        ["FaCheckCircle", "Pronto", C.accent2, ["Sistema completo rodando localmente", "Kanban, times, usuários, convites, Git e dashboard", "Testes automatizados e acessibilidade"]],
        ["FaRocket", "Próximos passos", C.accent3, ["Publicar o sistema em um servidor", "Testar o envio real de e-mails (SMTP)", "Validar o webhook com um repositório real"]],
    ];
    for (const [i, [ic, head, color, items]] of cols.entries()) {
        const x = 0.6 + i * 6.2;
        s.addShape(pres.ShapeType.roundRect, { x, y: 1.6, w: 5.95, h: 3.3, fill: { color: C.text2 }, line: { color: C.text2 }, rectRadius: 0.12, objectName: `Coluna ${head}` });
        await badge(s, ic, x + 0.4, 1.9, 0.75, color, "0B1020");
        text(s, head, { x: x + 1.35, y: 1.9, w: 4.2, h: 0.75, fontSize: 26, bold: true, color: C.background1, valign: "middle" });
        text(s, bullets(items), { x: x + 0.4, y: 3.0, w: 5.2, h: 1.8, fontSize: 20, color: C.background1 });
    }
    text(s, "Obrigado! Perguntas?", { x: 0.6, y: 5.5, w: 12, h: 1.0, fontSize: 44, bold: true, fontFace: "Cambria", color: C.background1, valign: "middle" });
    text(s, "Ana Luiza Lourenço · Arthur Rodrigues · Giovanna Tamos · Raphael Carneiro · Vitor Medina", { x: 0.6, y: 6.6, w: 12, h: 0.4, fontSize: 14, color: C.accent6 });
    log.push(note(s, "fecho", cum));
}

// ---------------------------------------------------------------- reserva (fora dos 7 minutos)
pres.addSection({ title: "Reserva (só para perguntas)" });
const reservaTag = (s) => {
    s.addShape(pres.ShapeType.roundRect, { x: 9.6, y: 0.55, w: 3.15, h: 0.42, fill: { color: C.accent3 }, line: { color: C.accent3 }, rectRadius: 0.21, objectName: "Etiqueta reserva" });
    text(s, "Reserva · só para perguntas", { x: 9.6, y: 0.55, w: 3.15, h: 0.42, fontSize: 13, bold: true, color: C.text1, align: "center", valign: "middle" });
};
{
    const s = pres.addSlide({ masterName: "Titulo", sectionTitle: "Reserva (só para perguntas)" });
    s.addText("Modelo de dados: 12 tabelas", { placeholder: "title" });
    reservaTag(s);
    frame(s, "25-der", 0.65, 1.55, 5.6, 4.95, "Diagrama entidade-relacionamento do banco MySQL");
    text(s, bullets(["Usuários, times e participações", "Tarefas, subtarefas, comentários e histórico", "Convites e redefinição de senha", "Notificações", "Repositórios Git e eventos Git pendentes"]), { x: 7.2, y: 1.8, w: 5.5, h: 3.5, fontSize: 20, color: C.text1 });
    log.push(note(s, "r-der", cum));
}
{
    const s = pres.addSlide({ masterName: "Titulo", sectionTitle: "Reserva (só para perguntas)" });
    s.addText("Perguntas prováveis", { placeholder: "title" });
    reservaTag(s);
    const qa = [
        ["A priorização usa inteligência artificial?", "Hoje usa regras de prazo e carga, atrás de uma interface que permite trocar por um modelo de IA."],
        ["Como os dados são protegidos?", "BCrypt, cookie httpOnly, bloqueio por tentativas, webhooks assinados e sessões encerradas ao trocar a senha."],
        ["Por que não há autocadastro?", "O sistema é interno da empresa: o acesso é por convite ou por conta criada pelo administrador."],
        ["O sistema já está no ar?", "Ainda não: roda localmente e a publicação em servidor é o próximo passo."],
    ];
    for (const [i, [q, a]] of qa.entries()) {
        const x = 0.6 + (i % 2) * 6.2, y = 1.6 + Math.floor(i / 2) * 2.65;
        s.addShape(pres.ShapeType.roundRect, { x, y, w: 5.95, h: 2.4, fill: { color: C.background2 }, line: { color: C.background2 }, rectRadius: 0.12, objectName: `Pergunta ${i + 1}` });
        text(s, q, { x: x + 0.35, y: y + 0.3, w: 5.25, h: 0.8, fontSize: 20, bold: true, color: C.text1 });
        text(s, a, { x: x + 0.35, y: y + 1.15, w: 5.25, h: 1.1, fontSize: 16, color: C.text1 });
    }
    log.push(note(s, "r-perguntas", cum));
}
{
    const s = pres.addSlide({ masterName: "Titulo", sectionTitle: "Reserva (só para perguntas)" });
    s.addText("Uso no celular", { placeholder: "title" });
    reservaTag(s);
    frame(s, "23-kanban-celular", 1.0, 1.5, 2.7, 5.1, "Quadro Kanban em tela de celular");
    text(s, bullets(["O quadro se adapta a telas pequenas", "As colunas rolam na horizontal", "Mesmas funções do computador"]), { x: 5.0, y: 2.4, w: 7.5, h: 2.5, fontSize: 24, color: C.text1 });
    log.push(note(s, "r-celular", cum));
}

// ---------------------------------------------------------------- gravação
const file = path.join(OUT, "Trilho-Apresentacao.pptx");
await pres.writeFile({ fileName: file });
await applyTheme(file, THEME);

const main = log.filter((item) => !item.reserva);
const total = main.reduce((acc, item) => acc + item.secs, 0);
const mm = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const roteiro = [
    "# Trilho — roteiro de fala (7 minutos + 3 de perguntas)",
    "",
    `Tempo estimado de fala: **${mm(total)}** (${main.reduce((a, i) => a + i.words, 0)} palavras a 135 palavras por minuto). O mesmo texto está nas anotações de cada slide.`,
    "",
    ...log.flatMap((item, i) => [
        `## Slide ${i + 1}${item.reserva ? " (reserva)" : ""} · ${item.quem}${item.reserva ? "" : ` · ${mm(item.start)}–${mm(item.start + item.secs)}`}`,
        "",
        item.texto,
        "",
    ]),
];
fs.writeFileSync(path.join(OUT, "roteiro-fala.md"), roteiro.join("\n"), "utf8");
for (const item of log) console.log(`${item.reserva ? "R" : " "} ${item.id.padEnd(18)} ${item.quem.padEnd(18)} ${String(item.words).padStart(3)} palavras  ${item.secs}s`);
console.log(`Total (sem reserva): ${mm(total)}  →  ${file}`);

