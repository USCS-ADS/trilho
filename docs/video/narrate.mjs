// Sintetiza as falas de uma versão (curto/medio/longo) e devolve { idDaFala: { ms, file } }.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { DIR } from "./lib.mjs";

// Como a voz deve ler siglas e nomes (a legenda mantém a grafia original).
const PRONUNCIA = [
    [/\.NET/g, "dot net"],
    [/Next\.js/g, "Next J S"],
    [/HMAC/g, "agá eme a cê"],
    [/MySQL/g, "My S Q L"],
    [/JWT/g, "J W T"],
    [/BCrypt/g, "bi-crípt"],
    [/\baxe\b/g, "áx"],
    [/\bCI\b/g, "ci-ai"],
    [/\bIA\b/g, "i á"],
    [/\bADS\b/g, "A D S"],
    [/\bUSCS\b/g, "U S C S"],
    [/\bUI\b/g, "u i"],
    [/\bSMTP\b/g, "S M T P"],
    [/\bURL\b/g, "u erre éle"],
    [/\bPR\b/g, "pull request"],
    [/Kanban/g, "Cânban"],
];

const RATE = Number(process.env.VOZ_RATE ?? 3);

export const paraFala = (texto) => PRONUNCIA.reduce((acc, [regex, troca]) => acc.replace(regex, troca), texto);

function wavMs(file) {
    const buffer = fs.readFileSync(file);
    const byteRate = buffer.readUInt32LE(28);
    let offset = 12;
    while (offset < buffer.length - 8) {
        const id = buffer.toString("ascii", offset, offset + 4);
        const size = buffer.readUInt32LE(offset + 4);
        if (id === "data") return Math.round((Math.min(size, buffer.length - offset - 8) / byteRate) * 1000);
        offset += 8 + size;
    }
    throw new Error(`WAV sem bloco data: ${file}`);
}

/** speeches: { id: textoDaLegenda } */
export function narrate(variant, speeches) {
    const outDir = path.join(DIR, "saida", "audio", variant);
    fs.mkdirSync(outDir, { recursive: true });
    const hashFile = path.join(outDir, "hashes.json");
    const known = fs.existsSync(hashFile) ? JSON.parse(fs.readFileSync(hashFile, "utf8")) : {};

    const pending = {};
    for (const [id, text] of Object.entries(speeches)) {
        const spoken = paraFala(text);
        const hash = crypto.createHash("sha1").update(`${RATE}:${spoken}`).digest("hex");
        if (known[id] !== hash || !fs.existsSync(path.join(outDir, `${id}.wav`))) {
            pending[id] = spoken;
            known[id] = hash;
        }
    }

    if (Object.keys(pending).length > 0) {
        const jsonFile = path.join(outDir, "pendentes.json");
        fs.writeFileSync(jsonFile, JSON.stringify(pending), "utf8");
        execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(DIR, "narrate.ps1"), "-Json", jsonFile, "-OutDir", outDir, "-Rate", String(RATE)], { stdio: "inherit" });
        fs.writeFileSync(hashFile, JSON.stringify(known, null, 2));
        console.log(`Falas sintetizadas: ${Object.keys(pending).length}`);
    }

    const audio = {};
    for (const id of Object.keys(speeches)) {
        const file = path.join(outDir, `${id}.wav`);
        audio[id] = { file, ms: wavMs(file) };
    }
    return audio;
}
