// Gera os roteiros em Markdown (texto + tempo de cada fala) para o usuário narrar com a própria voz.
// Uso: node roteiros.mjs  (depois de gravar as versões; lê saida/<versão>/timeline.json)
import fs from "node:fs";
import path from "node:path";
import { DIR } from "./lib.mjs";
import { stepsFor } from "./scenes.mjs";

const titulos = { curto: "Resumo rápido (~3 min)", medio: "Visão geral completa (~6 min)", longo: "Versão detalhada (~10 min)" };
const mmss = (ms) => `${String(Math.floor(ms / 60000)).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;

for (const variant of Object.keys(titulos)) {
    const file = path.join(DIR, "saida", variant, "timeline.json");
    if (!fs.existsSync(file)) continue;
    const timeline = JSON.parse(fs.readFileSync(file, "utf8"));
    const starts = Object.fromEntries(timeline.clips.map((clip) => [clip.id, clip]));
    const lines = [
        `# Trilho — roteiro para narrar: ${titulos[variant]}`,
        "",
        `Duração do vídeo: ${mmss(timeline.durationMs)}. O vídeo \`trilho-${variant}-legendas.mp4\` já tem as legendas na tela; leia cada trecho no momento indicado.`,
        "Os tempos são de início de cada fala (min:seg). A voz sintética leva o tempo entre parênteses; falando com naturalidade você deve caber no mesmo intervalo.",
        "",
    ];
    let scene = "";
    for (const step of stepsFor(variant).filter((item) => item.text)) {
        const clip = starts[step.id];
        if (!clip) continue;
        if (step.scene !== scene) {
            scene = step.scene;
            lines.push(`## ${scene[0].toUpperCase()}${scene.slice(1)}`, "");
        }
        lines.push(`**[${mmss(clip.startMs - 300)}]** (${Math.round(clip.ms / 1000)} s) ${step.text}`, "");
    }
    fs.writeFileSync(path.join(DIR, "saida", variant, `roteiro-${variant}.md`), lines.join("\n"), "utf8");
    console.log(`roteiro-${variant}.md`);
}
