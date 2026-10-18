// Captura as telas do Trilho (sistema real, dados da Nexus carregados por report-seed.mjs) para o relatório.
// Pré-requisitos: API em :5018, front em :3000, seed executado. Saída: docs/relatorio/figuras/*.png
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "..", "figuras");
const BASE = process.env.FRONT_URL ?? "http://localhost:3000";
const LOG = process.env.API_LOG;
const PASSWORD = "Nexus@2026";
const mail = (name) => `${name}@nexusanalytics.example`;

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

async function context(viewport = { width: 1280, height: 800 }, scale = 1) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, locale: "pt-BR" });
    // Esconde os indicadores de desenvolvimento do Next ("N", "1 Issue") para não aparecerem nas figuras.
    await ctx.addInitScript(() => {
        document.addEventListener("DOMContentLoaded", () => {
            const style = document.createElement("style");
            style.textContent = "nextjs-portal{display:none!important}";
            document.head.appendChild(style);
        });
    });
    return ctx;
}

const size = (page, width, height) => page.setViewportSize({ width, height });

async function login(page, email, password = PASSWORD) {
    await page.goto(`${BASE}/login`);
    await page.getByLabel("E-mail corporativo").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL(/dashboard/);
}

async function shot(page, name, { fullPage = false, delay = 600, clip } = {}) {
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(delay);
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage, ...(clip ? { clip } : {}) });
    console.log("ok", name);
}

// Telas de autenticação: recorta só o painel do formulário (a metade esquerda é decorativa) para o texto ficar legível.
async function authShot(page, name) {
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(600);
    const box = await page.evaluate(() => {
        const rects = [...document.querySelectorAll("body *")]
            .filter((el) => (el.children.length === 0 || ["INPUT", "BUTTON"].includes(el.tagName)) && el.getBoundingClientRect().left >= 580 && el.getBoundingClientRect().width > 0)
            .map((el) => el.getBoundingClientRect());
        const left = Math.min(...rects.map((r) => r.left));
        const top = Math.min(...rects.map((r) => r.top));
        const right = Math.max(...rects.map((r) => r.right));
        const bottom = Math.max(...rects.map((r) => r.bottom));
        return { x: Math.max(0, left - 40), y: Math.max(0, top - 40), width: right - left + 80, height: bottom - top + 80 };
    });
    await page.screenshot({ path: path.join(OUT, `${name}.png`), clip: box });
    console.log("ok", name);
}

// Janelas modais: recorta o retângulo da própria janela (com folga) para o texto ficar legível na página do relatório.
async function dialogShot(page, name) {
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(600);
    const box = await page.getByRole("dialog").boundingBox();
    const pad = 16;
    await page.screenshot({ path: path.join(OUT, `${name}.png`), clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + pad * 2, height: box.height + pad * 2 } });
    console.log("ok", name);
}

async function board(page) {
    await page.locator('main a[href^="/kanban/"]').first().waitFor();
}

function lastCodeFor(email) {
    const text = fs.readFileSync(LOG, "utf8");
    const at = text.lastIndexOf(`para ${email}`);
    return text.slice(at).match(/\b(\d{6})\b/)[1];
}

function inviteToken() {
    const text = fs.readFileSync(LOG, "utf8");
    const at = text.lastIndexOf("para carolina.mendes@");
    return text.slice(at).match(/activate-account\?token=([\w-]+)/)[1];
}

// ------------------------------------------------------------------ sem login
{
    const ctx = await context();
    const page = await ctx.newPage();

    await page.goto(`${BASE}/login`);
    await authShot(page, "01-login");

    await page.goto(`${BASE}/login?expired=1`);
    await authShot(page, "02-sessao-expirada");

    await page.goto(`${BASE}/reset-password`);
    await page.getByLabel("E-mail cadastrado").fill(mail("ana.lourenco"));
    await authShot(page, "03a-redefinir-etapa1");
    await page.getByRole("button", { name: "Enviar código" }).click();
    await page.waitForURL(/verify-code/);
    await page.waitForTimeout(800);
    await authShot(page, "03b-redefinir-etapa2");

    const code = lastCodeFor(mail("ana.lourenco"));
    await page.locator('input[aria-label="Dígito 1 do código"]').click();
    await page.keyboard.type(code, { delay: 80 });
    await page.getByRole("button", { name: /verificar|continuar|confirmar/i }).first().click();
    await page.waitForURL(/new-password/);
    await page.getByLabel("Nova senha", { exact: true }).fill("Nova@Senha2026");
    await authShot(page, "03c-redefinir-etapa3");

    await page.goto(`${BASE}/activate-account?token=${inviteToken()}`);
    await page.getByLabel("Nova senha", { exact: true }).fill("Carol@2026x");
    await authShot(page, "04-ativar-conta");
    await ctx.close();
}

// ------------------------------------------------------------------ administradora (Camila)
{
    const ctx = await context();
    const page = await ctx.newPage();
    await login(page, mail("camila.duarte"));

    await page.waitForTimeout(1200);
    await size(page, 1280, 520);
    await shot(page, "06-dashboard");
    await size(page, 1280, 800);

    await page.goto(`${BASE}/times`);
    await shot(page, "14-times");
    await page.getByRole("button", { name: "Gerenciar o time Backend" }).click();
    await page.getByRole("dialog").waitFor();
    await size(page, 1280, 1060);
    await dialogShot(page, "15-gerenciar-time");
    await size(page, 1280, 800);
    await page.keyboard.press("Escape");

    await page.goto(`${BASE}/integracoes-git`);
    await shot(page, "17-integracoes-git");
    await page.getByRole("button", { name: "Conectar repositório" }).click();
    await page.getByRole("dialog").waitFor();
    await dialogShot(page, "18-conectar-repositorio");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Configurar" }).first().click();
    await page.getByRole("dialog").waitFor();
    await dialogShot(page, "18b-configurar-repositorio");
    await page.keyboard.press("Escape");

    await page.goto(`${BASE}/configuracoes`);
    await page.locator("tbody tr").first().waitFor();
    await size(page, 1280, 1060);
    await shot(page, "19-configuracoes-admin");
    await size(page, 1280, 800);
    await page.getByRole("button", { name: "Convidar usuário" }).click();
    await page.getByRole("dialog").waitFor();
    await page.getByRole("dialog").getByLabel("Nome completo").fill("Rafael Teixeira");
    await page.getByRole("dialog").getByLabel("E-mail").fill("rafael.teixeira@nexusanalytics.example");
    await dialogShot(page, "20-convidar-usuario");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Criar usuário" }).click();
    await page.getByRole("dialog").waitFor();
    await page.getByRole("dialog").getByLabel("Senha inicial").fill("Inicial@2026");
    await dialogShot(page, "21-criar-usuario");
    await ctx.close();
}

// ------------------------------------------------------------------ líder (Ana, Backend)
{
    const ctx = await context();
    const page = await ctx.newPage();
    await login(page, mail("ana.lourenco"));

    await page.goto(`${BASE}/kanban`);
    await board(page);
    await size(page, 1840, 560);
    await shot(page, "07-kanban", { clip: { x: 240, y: 0, width: 1600, height: 440 } });

    await page.getByLabel("Filtrar por prioridade").selectOption("high");
    await page.getByLabel("Buscar tarefa por título").fill("a");
    await shot(page, "08-kanban-filtros", { clip: { x: 240, y: 0, width: 1600, height: 330 } });
    await size(page, 1280, 800);
    await page.getByRole("button", { name: "Limpar filtros" }).click();

    await page.getByRole("button", { name: "Nova tarefa" }).click();
    await page.getByRole("dialog").waitFor();
    await page.getByRole("dialog").getByLabel("Título").fill("Implementar cache das consultas do quadro");
    await page.getByRole("dialog").getByLabel("Descrição").fill("Reduzir o tempo de carregamento do Kanban para menos de 2 segundos.");
    await page.waitForTimeout(500);
    await dialogShot(page, "09-nova-tarefa");
    await page.keyboard.press("Escape");

    await page.goto(`${BASE}/kanban/4`);
    await page.getByRole("button", { name: "Editar" }).waitFor();
    await size(page, 1280, 1000);
    await shot(page, "10-detalhe-tarefa");
    await size(page, 1280, 800);
    await page.getByRole("button", { name: "Editar" }).click();
    await page.getByRole("dialog").waitFor();
    await dialogShot(page, "12-editar-tarefa");
    await page.keyboard.press("Escape");

    await page.goto(`${BASE}/kanban/6`);
    await page.getByRole("button", { name: "Editar" }).waitFor();
    await size(page, 1280, 920);
    await shot(page, "11-detalhe-tarefa-git");
    await size(page, 1280, 800);

    await page.goto(`${BASE}/tarefas`);
    await size(page, 1280, 900);
    await shot(page, "16-priorizacao");
    await ctx.close();
}

// ------------------------------------------------------------------ membro (Vitor)
{
    const ctx = await context();
    const page = await ctx.newPage();
    await login(page, mail("vitor.medina"));

    await page.goto(`${BASE}/kanban`);
    await board(page);
    await page.getByRole("button", { name: /Notificações/ }).click();
    await page.waitForTimeout(700);
    await shot(page, "13-notificacoes");
    await page.keyboard.press("Escape");

    await page.goto(`${BASE}/configuracoes`);
    await page.getByText("Meu perfil").waitFor();
    await page.getByLabel("Senha atual").fill("senha-atual");
    await page.getByLabel("Nova senha", { exact: true }).fill("Nova@Senha2026");
    await size(page, 1280, 900);
    await shot(page, "22-configuracoes-membro");
    await ctx.close();
}

// ------------------------------------------------------------------ celular (Ana)
{
    const ctx = await context({ width: 390, height: 740 }, 2);
    const page = await ctx.newPage();
    await login(page, mail("ana.lourenco"));
    await page.goto(`${BASE}/kanban`);
    await board(page);
    await shot(page, "23-kanban-celular");
    await ctx.close();
}

// ------------------------------------------------------------------ bloqueio de conta (por último: trava o Lucas)
{
    const ctx = await context();
    const page = await ctx.newPage();

    for (let attempt = 0; attempt < 5; attempt += 1) {
        await page.goto(`${BASE}/login`);
        await page.getByLabel("E-mail corporativo").fill(mail("lucas.prado"));
        await page.getByLabel("Senha", { exact: true }).fill("Errada@1234");
        await page.getByRole("button", { name: "Entrar" }).click();
        await page.waitForTimeout(700);
    }
    await page.goto(`${BASE}/login`);
    await page.getByLabel("E-mail corporativo").fill(mail("lucas.prado"));
    await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByText(/Muitas tentativas/i).waitFor();
    await authShot(page, "05-bloqueio-conta");
    await ctx.close();
}

await browser.close();
