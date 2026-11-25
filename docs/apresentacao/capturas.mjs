// Recaptura as telas do slide 5 (formato quase quadrado, que cabe nos quadros do modelo da disciplina).
// Pré-requisitos: API em :5018 com a Nexus semeada (docs/relatorio/scripts/report-seed.mjs) e o front em :3000.
// Saída: img/dashboard.png, img/kanban.png, img/priorizacao.png e img/tarefa-git.png (janela de 740 px: layout compacto, quase quadrado). Uso: node capturas.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
// O Playwright já está instalado em docs/relatorio (mesmo Chromium em cache).
const { chromium } = createRequire(path.join(here, "../relatorio/package.json"))("playwright");
const OUT = path.join(here, "img");
const BASE = process.env.FRONT_URL ?? "http://localhost:3000";
const PASSWORD = "Nexus@2026";
const mail = (name) => `${name}@nexusanalytics.example`;
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function session(who, viewport, scale = 1) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, locale: "pt-BR" });
    // Esconde os indicadores de desenvolvimento do Next ("N") para não aparecerem nos prints.
    await ctx.addInitScript(() => {
        document.addEventListener("DOMContentLoaded", () => {
            const style = document.createElement("style");
            style.textContent = "nextjs-portal{display:none!important}";
            document.head.appendChild(style);
        });
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`);
    await page.getByLabel("E-mail corporativo").fill(mail(who));
    await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL(/dashboard/, { timeout: 60000 });
    return { ctx, page };
}

{
    const { ctx, page } = await session("camila.duarte", { width: 740, height: 780 });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, "dashboard.png") });
    console.log("ok dashboard");
    await ctx.close();
}
{
    // Líder (Ana). Primeiro, no layout largo, devolve ao Backlog o card que a gravação do vídeo moveu (se for o caso).
    const { ctx, page } = await session("ana.lourenco", { width: 1280, height: 800 });
    await page.goto(`${BASE}/kanban`);
    await page.locator('main a[href^="/kanban/"]').first().waitFor({ timeout: 60000 });
    const column = (label) => page.locator("div.w-72", { has: page.getByText(label, { exact: true }) });
    const moved = column("A Fazer").locator('a[href^="/kanban/"]', { hasText: "Criar endpoint" }).first();
    if ((await column("Backlog").locator('a[href^="/kanban/"]').count()) === 0 && (await moved.count()) > 0) {
        const from = await moved.boundingBox();
        const to = await column("Backlog").boundingBox();
        await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
        await page.mouse.down();
        await page.mouse.move(from.x + from.width / 2 - 24, from.y + from.height / 2 + 12, { steps: 6 });
        await page.mouse.move(to.x + to.width / 2, to.y + 90, { steps: 28 });
        await page.waitForTimeout(350);
        await page.mouse.up();
        await page.waitForTimeout(1200);
    }
    // Agora no layout compacto (740 px), que enche melhor os quadros do modelo.
    await page.setViewportSize({ width: 740, height: 780 });
    await page.goto(`${BASE}/kanban`);
    await page.locator('main a[href^="/kanban/"]').first().waitFor({ timeout: 60000 });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT, "kanban.png") });
    console.log("ok kanban");
    await page.goto(`${BASE}/tarefas`);
    await page.getByRole("button", { name: "Aplicar sugestões" }).waitFor({ timeout: 60000 });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT, "priorizacao.png") });
    console.log("ok priorizacao");
    await ctx.close();
}
{
    // Tela 3 do slide 5: recorte do detalhe da tarefa #6 com a prioridade sugerida (RF07) e o pull request ligado (RF06/UC10).
    const { ctx, page } = await session("ana.lourenco", { width: 1280, height: 920 }, 2);
    await page.goto(`${BASE}/kanban/6`);
    await page.getByRole("button", { name: "Editar" }).waitFor({ timeout: 60000 });
    await page.getByText("Integração Git", { exact: false }).first().waitFor({ timeout: 60000 });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT, "tarefa-git.png"), clip: { x: 938, y: 349, width: 312, height: 413 } });
    console.log("ok tarefa-git");
    await ctx.close();
}
await browser.close();

