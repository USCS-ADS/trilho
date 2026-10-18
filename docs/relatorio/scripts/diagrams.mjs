// Gera as figuras de arquitetura e o DER (Mermaid renderizado pelo Chromium) em fundo branco, para impressão.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "..", "figuras");
const model = JSON.parse(fs.readFileSync(path.join(here, "../dados/modelo.json"), "utf8"));

// ------------------------------------------------------------------ DER
const sqlType = (t) => t.replace(/\(.*\)/, "").replace("datetime", "datetime").replace("tinyint", "bool");
const entityLines = [];
const relationLines = [];

for (const table of model) {
    const fkColumns = new Set(table.fks.map((f) => f.column));
    const pk = new Set(table.pk);
    entityLines.push(`    ${table.table} {`);
    const priority = ["Name", "Title", "FullName", "Email", "Role", "Status", "Priority", "Type", "Message", "Body", "Provider", "Position"];
    const isKey = (c) => pk.has(c.name) || fkColumns.has(c.name);
    const mainColumns = table.columns.filter((c) => !isKey(c)).sort((a, b) => (priority.indexOf(a.name) + 100) % 100 - (priority.indexOf(b.name) + 100) % 100).slice(0, 3);
    for (const column of table.columns.filter((c) => isKey(c) || mainColumns.includes(c))) {
        const keys = [pk.has(column.name) ? "PK" : null, fkColumns.has(column.name) ? "FK" : null].filter(Boolean).join(",");
        entityLines.push(`        ${sqlType(column.type).replace(/\s/g, "_")} ${column.name}${keys ? ` ${keys}` : ""}`);
    }
    entityLines.push("    }");

    for (const fk of table.fks) {
        const column = table.columns.find((c) => c.name === fk.column);
        const parentSide = column?.nullable ? "|o" : "||";
        relationLines.push(`    ${fk.table} ${parentSide}--o{ ${table.table} : "${fk.column}"`);
    }
}
const er = `erDiagram\n${relationLines.join("\n")}\n${entityLines.join("\n")}`;

// ------------------------------------------------------------------ Arquitetura
const architecture = `flowchart TB
    U["Usuário<br/>(Membro, Líder ou Administrador)"]
    subgraph FRONT["Frontend — Next.js 16 e React 19"]
        direction LR
        P["Páginas e<br/>Server Actions"]
        A["Camada de API<br/>(somente servidor)"]
        S["Sessão: cookie httpOnly<br/>e proxy.ts"]
        P --> A
        P --> S
    end
    subgraph BACK["Backend — .NET 8 em camadas"]
        direction LR
        API["Trilho.Api<br/>controllers e políticas"]
        APP["Trilho.Application<br/>casos de uso"]
        DOM["Trilho.Domain<br/>entidades e interfaces"]
        INF["Trilho.Infrastructure<br/>EF Core, Git, e-mail, jobs"]
        API --> APP --> DOM
        INF -. implementa .-> DOM
    end
    DB[("MySQL 8")]
    GIT["GitHub e GitLab"]
    MAIL["Servidor SMTP"]
    U -->|HTTPS| P
    A -->|"HTTPS + JWT"| API
    GIT -->|"webhooks assinados"| API
    INF --> DB
    INF --> MAIL
    classDef box fill:#EEF3FF,stroke:#4F8CFF,color:#0F1420;
    class P,A,S,API,APP,DOM,INF box;`;

const browser = await chromium.launch();

async function render(definition, file, { width, scale = 2 } = {}) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: scale });
    await page.setContent('<html><body style="margin:0;background:#fff"><div id="host" style="padding:16px"></div></body></html>');
    await page.addScriptTag({ path: path.join(here, "../node_modules/mermaid/dist/mermaid.min.js") });
    await page.evaluate(async (code) => {
        // eslint-disable-next-line no-undef
        mermaid.initialize({ startOnLoad: false, theme: "neutral", themeVariables: { fontSize: "15px" }, securityLevel: "loose", er: { useMaxWidth: false, minEntityWidth: 70, minEntityHeight: 30, entityPadding: 5, diagramPadding: 8 }, flowchart: { useMaxWidth: false, htmlLabels: true }, fontFamily: "Arial" });
        // eslint-disable-next-line no-undef
        const { svg } = await mermaid.render("diagrama", code);
        document.getElementById("host").innerHTML = svg;
    }, definition);
    await page.locator("#host svg").first().screenshot({ path: path.join(OUT, file) });
    console.log("ok", file);
    await page.close();
}

await render(architecture, "24-arquitetura-camadas.png", { width: 1400 });
await render(er, "25-der.png", { width: 1500 });
await browser.close();

fs.writeFileSync(path.join(here, "../dados/der.mmd"), er);
