// Grava uma versão do vídeo. Uso: node record.mjs <curto|medio|longo> [--only=idDaCena,...] [--dry]
//   Pré-requisitos: API em :5018 (banco descartável com a Nexus semeada por report-seed.mjs) e o front em :3000.
//   Saída: saida/<versão>/video.webm + timeline.json (instantes das falas, para build.mjs).
import fs from "node:fs";
import path from "node:path";
import { BASE, DIR, Run, chromium, sleep } from "./lib.mjs";
import { narrate } from "./narrate.mjs";
import { PASSWORD, stepsFor } from "./scenes.mjs";

const variant = process.argv[2];
if (!["curto", "medio", "longo"].includes(variant)) {
    console.error("Uso: node record.mjs <curto|medio|longo> [--only=cena1,cena2] [--dry]");
    process.exit(1);
}
const only = process.argv.find((arg) => arg.startsWith("--only="))?.slice(7).split(",");
const dry = process.argv.includes("--dry");

const mail = (nome) => `${nome}@nexusanalytics.example`;
const steps = stepsFor(variant).filter((step) => !only || only.includes(step.scene));

// ---------------------------------------------------------------- vozes
const speeches = Object.fromEntries(steps.filter((step) => step.text).map((step) => [step.id, step.text]));
const audio = narrate(variant, speeches);
const narrationMs = Object.values(audio).reduce((sum, clip) => sum + clip.ms, 0);
console.log(`[${variant}] ${Object.keys(audio).length} falas, ${(narrationMs / 1000 / 60).toFixed(2)} min de voz`);
if (dry) process.exit(0);

// ---------------------------------------------------------------- aquecimento (o Next compila cada rota na primeira visita)
async function warmUp() {
    const browser = await chromium.launch();
    const roles = [
        ["camila.duarte", ["/dashboard", "/times", "/integracoes-git", "/configuracoes", "/kanban", "/kanban/6"]],
        ["ana.lourenco", ["/kanban", "/kanban/4", "/tarefas", "/times"]],
        ["vitor.medina", ["/kanban", "/configuracoes"]],
    ];
    for (const [who, pages] of roles) {
        const context = await browser.newContext({ locale: "pt-BR" });
        const page = await context.newPage();
        await page.goto(`${BASE}/login`);
        await page.getByLabel("E-mail corporativo").fill(mail(who));
        await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
        await page.getByRole("button", { name: "Entrar" }).click();
        await page.waitForURL(/dashboard/);
        for (const route of pages) await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" }).catch(() => {});
        await context.close();
    }
    await page0(browser);
    await browser.close();
}
async function page0(browser) {
    const context = await browser.newContext({ locale: "pt-BR" });
    const page = await context.newPage();
    for (const route of ["/login", "/reset-password"]) await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" }).catch(() => {});
    await context.close();
}
console.log("Aquecendo as rotas…");
await warmUp();

// ---------------------------------------------------------------- gravação
const outDir = path.join(DIR, "saida", variant);
fs.rmSync(outDir, { recursive: true, force: true });
const run = new Run(variant, { audio, outDir });
await run.open();
await sleep(300);

const failures = [];
for (const step of steps.filter((item) => item.text)) {
    console.log(`  · ${step.scene}/${step.id} @ ${(run.now() / 1000).toFixed(1)} s`);
    try {
        if (!step.text) continue; // sem fala nesta versão: o passo (e a ação) não entra no vídeo
        await run.narrated(step.id, step.text, step.do);
    } catch (error) {
        failures.push({ step: step.id, message: String(error.message ?? error).split("\n")[0] });
        console.error(`    ! falhou: ${failures.at(-1).message}`);
        await run.cap("");
    }
}
await sleep(800);
const durationMs = run.now();
const video = await run.close();
fs.renameSync(video, path.join(outDir, "video.webm"));
fs.writeFileSync(path.join(outDir, "timeline.json"), JSON.stringify({ variant, durationMs, clips: run.clips, cues: run.cues, failures }, null, 2));
console.log(`[${variant}] gravado: ${(durationMs / 1000 / 60).toFixed(2)} min, ${failures.length} falha(s)`);
