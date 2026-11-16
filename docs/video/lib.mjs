// Biblioteca de gravação dos vídeos do Trilho: navegador com cursor visível, legendas na tela e linha do tempo
// (instantes de cada fala), usada por record.mjs e build.mjs.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { cardHtml } from "./cards.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
// O Playwright já está instalado em docs/relatorio (mesmas versões do Chromium em cache).
export const { chromium } = createRequire(path.join(here, "../relatorio/package.json"))("playwright");

export const BASE = process.env.FRONT_URL ?? "http://localhost:3000";
export const DIR = here;
export const FIGURAS = path.join(here, "..", "relatorio", "figuras");
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const VIEWPORT = { width: 1280, height: 720 };

/** Atraso entre o início da ação e o início da voz, e folga ao fim de cada fala (ms). */
const LEAD = 200;
const PAD = 450;

// Cursor falso (o Playwright não desenha o ponteiro no vídeo), anel de clique, faixa de legenda e destaque.
const OVERLAY = `(() => {
  if (window.top !== window) return;
  const ss = (key, value) => { try { if (value === undefined) return sessionStorage.getItem(key); sessionStorage.setItem(key, value); } catch { return null; } };
  const start = () => {
    if (document.getElementById("__vid")) return;
    const root = document.createElement("div");
    root.id = "__vid";
    root.innerHTML = '<style>' +
      'nextjs-portal{display:none!important}' +
      '#__vid{position:fixed;inset:0;pointer-events:none;z-index:2147483647}' +
      '#__cur{position:absolute;left:0;top:0;width:30px;height:30px;transition:transform .04s linear}' +
      '.__ring{position:absolute;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:3px solid #4F8CFF;animation:__ring .55s ease-out forwards}' +
      '@keyframes __ring{to{transform:scale(3.2);opacity:0}}' +
      '#__cap{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);max-width:1040px;padding:12px 24px;border-radius:12px;' +
      'background:rgba(8,12,22,.86);color:#fff;font:600 24px/1.35 system-ui,Segoe UI,Arial,sans-serif;text-align:center;display:none}' +
      '#__spot{position:absolute;border:3px solid #FFB020;border-radius:10px;box-shadow:0 0 0 6px rgba(255,176,32,.25);display:none}' +
      '</style>' +
      '<div id="__spot"></div><div id="__cap"></div>' +
      '<svg id="__cur" viewBox="0 0 24 24"><path d="M3 2l7.5 19 2.7-7.6L21 10.7z" fill="#fff" stroke="#0F1420" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.documentElement.appendChild(root);
    const cur = root.querySelector("#__cur");
    const cap = root.querySelector("#__cap");
    const spot = root.querySelector("#__spot");
    const move = (x, y) => { cur.style.transform = "translate(" + x + "px," + y + "px)"; ss("cx", x); ss("cy", y); };
    move(Number(ss("cx")) || 640, Number(ss("cy")) || 360);
    document.addEventListener("mousemove", (event) => move(event.clientX, event.clientY), true);
    document.addEventListener("mousedown", (event) => {
      const ring = document.createElement("div");
      ring.className = "__ring";
      ring.style.left = event.clientX + "px";
      ring.style.top = event.clientY + "px";
      root.appendChild(ring);
      setTimeout(() => ring.remove(), 700);
    }, true);
    window.__cap = (text) => { ss("cap", text || ""); cap.textContent = text || ""; cap.style.display = text ? "block" : "none"; };
    window.__spot = (rect) => {
      if (!rect) { spot.style.display = "none"; return; }
      Object.assign(spot.style, { display: "block", left: rect.x - 6 + "px", top: rect.y - 6 + "px", width: rect.width + 12 + "px", height: rect.height + 12 + "px" });
    };
    window.__cap(ss("cap"));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();`;

// Frases, e frases longas partidas na vírgula/dois-pontos mais próxima do meio, para a legenda caber em até duas linhas.
function sentences(text, max = 118) {
    const split = (part) => {
        if (part.length <= max) return [part];
        const marks = [...part.matchAll(/[,:;] /g)].map((m) => m.index + 1);
        if (marks.length === 0) return [part];
        const mid = part.length / 2;
        const at = marks.reduce((best, mark) => (Math.abs(mark - mid) < Math.abs(best - mid) ? mark : best));
        return [...split(part.slice(0, at).trim()), ...split(part.slice(at).trim())];
    };
    return text.split(/(?<=[.!?])\s+/).filter(Boolean).flatMap(split);
}

export class Run {
    constructor(variant, { audio, outDir }) {
        this.variant = variant;
        this.audio = audio; // { idDaFala: { ms, file } }
        this.outDir = outDir;
        this.clips = [];
        this.cues = [];
        this.mark = [];
        this.pos = { x: 640, y: 360 };
    }

    async open() {
        fs.mkdirSync(this.outDir, { recursive: true });
        this.browser = await chromium.launch();
        this.context = await this.browser.newContext({
            viewport: VIEWPORT,
            locale: "pt-BR",
            recordVideo: { dir: this.outDir, size: VIEWPORT },
        });
        await this.context.addInitScript(OVERLAY);
        await this.context.route(`${BASE}/__card/**`, (route) => {
            const url = new URL(route.request().url());
            route.fulfill({ contentType: "text/html; charset=utf-8", body: cardHtml(url.pathname.split("/").pop(), url.searchParams) });
        });
        await this.context.route(`${BASE}/__asset/**`, (route) => {
            const name = decodeURIComponent(new URL(route.request().url()).pathname.split("/").pop());
            route.fulfill({ contentType: "image/png", body: fs.readFileSync(path.join(FIGURAS, name)) });
        });
        this.page = await this.context.newPage();
        this.t0 = Date.now();
    }

    now() {
        return Date.now() - this.t0;
    }

    async close() {
        const video = this.page.video();
        await this.context.close();
        const file = await video.path();
        await this.browser.close();
        return file;
    }

    // ------------------------------------------------------------------ legendas e fala
    async cap(text) {
        await this.page.evaluate((value) => window.__cap?.(value), text).catch(() => {});
    }

    /** Mostra a fala (legenda por frase) enquanto executa a ação; só termina quando a voz acabaria. */
    async narrated(id, text, action) {
        const clip = this.audio[id];
        if (!clip) throw new Error(`Sem áudio para a fala "${id}" (rode narrate antes)`);
        const start = this.now();
        this.clips.push({ id, startMs: start + LEAD, ms: clip.ms, file: clip.file });
        const parts = sentences(text);
        const total = parts.reduce((sum, part) => sum + part.length, 0);
        const captions = (async () => {
            let at = start + LEAD;
            for (const part of parts) {
                const duration = (clip.ms * part.length) / total;
                this.cues.push({ startMs: at, endMs: at + duration, text: part });
                await this.cap(part);
                await sleep(duration);
                at += duration;
            }
        })();
        await action(this);
        await captions;
        await sleep(PAD);
        await this.cap("");
    }

    // ------------------------------------------------------------------ ações com cursor visível
    async goto(urlPath, { settle = 700 } = {}) {
        await this.page.goto(`${BASE}${urlPath}`, { waitUntil: "load" });
        await this.page.waitForLoadState("networkidle").catch(() => {});
        await sleep(settle);
    }

    async move(locator, { steps } = {}) {
        await locator.scrollIntoViewIfNeeded().catch(() => {});
        const box = await locator.boundingBox();
        if (!box) return null;
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        const distance = Math.hypot(x - this.pos.x, y - this.pos.y);
        await this.page.mouse.move(x, y, { steps: steps ?? Math.max(10, Math.round(distance / 22)) });
        this.pos = { x, y };
        await sleep(160);
        return box;
    }

    async click(locator) {
        await this.move(locator);
        await this.page.mouse.down();
        await sleep(70);
        await this.page.mouse.up();
        await sleep(250);
    }

    async type(locator, text, { delay = 60 } = {}) {
        await this.click(locator);
        await locator.pressSequentially(text, { delay });
    }

    async select(locator, value) {
        await this.move(locator);
        await locator.selectOption(value);
        await sleep(300);
    }

    async spot(locator, ms = 1800) {
        const box = await locator.boundingBox();
        if (!box) return;
        await this.page.evaluate((rect) => window.__spot?.(rect), box);
        await sleep(ms);
        await this.page.evaluate(() => window.__spot?.(null));
    }

    async scroll(deltaY, steps = 6) {
        for (let i = 0; i < steps; i += 1) {
            await this.page.mouse.wheel(0, deltaY / steps);
            await sleep(90);
        }
        await sleep(250);
    }

    async drag(card, target, { offsetY = 90 } = {}) {
        const from = await card.boundingBox();
        const to = await target.boundingBox();
        await this.move(card);
        await this.page.mouse.down();
        await this.page.mouse.move(from.x + from.width / 2 + 24, from.y + from.height / 2 + 12, { steps: 6 });
        await this.page.mouse.move(to.x + to.width / 2, to.y + offsetY, { steps: 28 });
        await sleep(350);
        await this.page.mouse.up();
        this.pos = { x: to.x + to.width / 2, y: to.y + offsetY };
        await sleep(700);
    }

    async login(email, password, { slow = true } = {}) {
        await this.goto("/login", { settle: 400 });
        const form = this.page;
        await this.type(form.getByLabel("E-mail corporativo"), email, { delay: slow ? 45 : 5 });
        await this.type(form.getByLabel("Senha", { exact: true }), password, { delay: slow ? 70 : 5 });
        await this.click(form.getByRole("button", { name: "Entrar" }));
        await this.page.waitForURL(/dashboard/, { timeout: 30000 });
        await this.page.waitForLoadState("networkidle").catch(() => {});
        await sleep(900);
    }

    async logout() {
        await this.context.clearCookies();
        await this.page.goto(`${BASE}/login`, { waitUntil: "load" });
    }

    async card(name, query = "") {
        await this.page.goto(`${BASE}/__card/${name}${query}`, { waitUntil: "load" });
        await sleep(500);
    }

    column(label) {
        return this.page.locator("div.w-72", { has: this.page.getByText(label, { exact: true }) });
    }

    async waitBoard() {
        await this.page.locator('main a[href^="/kanban/"]').first().waitFor({ timeout: 30000 });
        await sleep(600);
    }
}
