// Monta os MP4 de uma versão a partir da gravação. Uso: node build.mjs <curto|medio|longo>
//   Gera saida/<versão>/: trilha.wav, legendas.srt, trilho-<versão>-voz.mp4 (com a voz) e trilho-<versão>-legendas.mp4 (mudo).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { DIR } from "./lib.mjs";

const variant = process.argv[2];
if (!["curto", "medio", "longo"].includes(variant)) {
    console.error("Uso: node build.mjs <curto|medio|longo>");
    process.exit(1);
}
const outDir = path.join(DIR, "saida", variant);
const timeline = JSON.parse(fs.readFileSync(path.join(outDir, "timeline.json"), "utf8"));
const OFFSET_MS = Number(process.env.AUDIO_OFFSET_MS ?? -300); // calibração entre o relógio do script e o do vídeo

function findFfmpeg() {
    if (process.env.FFMPEG) return process.env.FFMPEG;
    const root = path.join(process.env.LOCALAPPDATA ?? "", "Microsoft", "WinGet", "Packages");
    const stack = fs.existsSync(root) ? [root] : [];
    while (stack.length) {
        const dir = stack.pop();
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) stack.push(full);
            else if (entry.name.toLowerCase() === "ffmpeg.exe") return full;
        }
    }
    return "ffmpeg";
}
const ffmpeg = findFfmpeg();

// ---------------------------------------------------------------- trilha de áudio (um WAV com silêncios entre as falas)
function readWav(file) {
    const buffer = fs.readFileSync(file);
    const rate = buffer.readUInt32LE(24);
    let offset = 12;
    while (offset < buffer.length - 8) {
        const id = buffer.toString("ascii", offset, offset + 4);
        const size = buffer.readUInt32LE(offset + 4);
        if (id === "data") return { rate, pcm: buffer.subarray(offset + 8, offset + 8 + Math.min(size, buffer.length - offset - 8)) };
        offset += 8 + size;
    }
    throw new Error(`WAV inválido: ${file}`);
}

const RATE = 22050;
const totalSamples = Math.ceil(((timeline.durationMs + 1500) / 1000) * RATE);
const track = Buffer.alloc(totalSamples * 2);
for (const clip of timeline.clips) {
    const { rate, pcm } = readWav(clip.file);
    if (rate !== RATE) throw new Error(`Taxa inesperada ${rate} em ${clip.file}`);
    const at = Math.round(((clip.startMs + OFFSET_MS) / 1000) * RATE) * 2;
    pcm.copy(track, at, 0, Math.min(pcm.length, track.length - at));
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + track.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(RATE, 24);
header.writeUInt32LE(RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(track.length, 40);
fs.writeFileSync(path.join(outDir, "trilha.wav"), Buffer.concat([header, track]));

// ---------------------------------------------------------------- legendas (.srt)
const stamp = (ms) => {
    const t = Math.max(0, Math.round(ms));
    const pad = (n, w = 2) => String(n).padStart(w, "0");
    return `${pad(Math.floor(t / 3600000))}:${pad(Math.floor(t / 60000) % 60)}:${pad(Math.floor(t / 1000) % 60)},${pad(t % 1000, 3)}`;
};
fs.writeFileSync(
    path.join(outDir, "legendas.srt"),
    timeline.cues.map((cue, i) => `${i + 1}\n${stamp(cue.startMs + OFFSET_MS)} --> ${stamp(cue.endMs + OFFSET_MS)}\n${cue.text}\n`).join("\n"),
    "utf8",
);

// ---------------------------------------------------------------- MP4
const video = path.join(outDir, "video.webm");
const common = ["-hide_banner", "-loglevel", "error", "-y"];
const videoArgs = ["-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart"];
execFileSync(ffmpeg, [...common, "-i", video, "-i", path.join(outDir, "trilha.wav"), "-map", "0:v", "-map", "1:a", ...videoArgs, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "128k", "-shortest", path.join(outDir, `trilho-${variant}-voz.mp4`)], { stdio: "inherit" });
execFileSync(ffmpeg, [...common, "-i", video, "-map", "0:v", ...videoArgs, "-an", path.join(outDir, `trilho-${variant}-legendas.mp4`)], { stdio: "inherit" });
console.log(`[${variant}] MP4 gerados em ${outDir}`);
