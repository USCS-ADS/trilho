// Grava o vídeo curto (cerca de 30 s, sem legendas nem voz) do slide 6: arrastar tarefa, detalhe, nova tarefa e priorização.
// Reaproveita a biblioteca de gravação de docs/video. Pré-requisitos: API em :5018 com a Nexus semeada e o front em :3000.
// Saída: saida/demo-bruto.webm e saida/demo-inicio.txt (segundos a cortar do início, onde está o login). Uso: node demo30.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Run, sleep } from "../video/lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "saida", "demo-raw");
fs.rmSync(outDir, { recursive: true, force: true });

const run = new Run("demo", { audio: {}, outDir });
await run.open();
await sleep(300);

await run.login("ana.lourenco@nexusanalytics.example", "Nexus@2026", { slow: false });
await run.goto("/kanban", { settle: 500 });
await run.waitBoard();
const startAt = run.now() / 1000;
await sleep(1500);

// 1) mudar o status arrastando o card
const card = run.column("Backlog").locator('a[href^="/kanban/"]').first();
await run.drag(card, run.column("A Fazer"));
await sleep(1500);

// 2) detalhe da tarefa (descrição, subtarefas, comentários, Git e histórico)
await run.goto("/kanban/6", { settle: 1200 });
await run.scroll(420);
await sleep(1800);
await run.scroll(-420);

// 3) nova tarefa
await run.goto("/kanban", { settle: 500 });
await run.waitBoard();
await run.click(run.page.getByRole("button", { name: "Nova tarefa" }));
const dialog = run.page.getByRole("dialog");
await dialog.waitFor();
await run.type(dialog.getByLabel("Título"), "Implementar cache das consultas", { delay: 40 });
await sleep(1500);
await run.page.keyboard.press("Escape");

// 4) priorização sugerida
await run.goto("/tarefas", { settle: 1200 });
await run.scroll(300);
await sleep(1800);
const endAt = run.now() / 1000;

const video = await run.close();
fs.renameSync(video, path.join(here, "saida", "demo-bruto.webm"));
fs.writeFileSync(path.join(here, "saida", "demo-inicio.txt"), `${startAt.toFixed(2)} ${(endAt - startAt).toFixed(2)}`);
console.log(`gravado: início útil em ${startAt.toFixed(1)} s, ${(endAt - startAt).toFixed(1)} s de conteúdo`);
