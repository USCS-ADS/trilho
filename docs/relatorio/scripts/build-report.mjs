// Monta "Complemento do Relatorio - Desenvolvimento.docx" a partir de content.mjs.
// A numeração de figuras, quadros e códigos é calculada aqui (ordem de aparição) e as citações no texto são
// verificadas: toda ilustração precisa ser citada ANTES de aparecer.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, ImageRun, LevelFormat, Packer, PageNumber,
    Paragraph, ShadingType, Table, TableLayoutType, TableRow, TableCell, TextRun, WidthType,
} from "docx";
import { FIRST_FIGURE, FIRST_QUADRO, PIECES, SCENARIOS, SRC } from "./content.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "../../..");
const FIG_DIR = path.join(here, "../figuras");
const OUT = process.env.OUT ?? path.join(here, "../Complemento do Relatorio - Desenvolvimento.docx");
const model = JSON.parse(fs.readFileSync(path.join(here, "../dados/modelo.json"), "utf8"));
const schemaSql = fs.readFileSync(path.join(here, "../dados/schema.sql"), "utf8");

const FONT = "Arial";
const CODE_FONT = "Courier New";
const CM = 37.795; // pixels por cm (96 dpi)

// ------------------------------------------------------------------ numeração
const numbers = { f: {}, q: {}, c: {} };
const defined = {}; // chave -> índice global do bloco
const mentions = {}; // chave -> índice global da primeira citação
let nFig = FIRST_FIGURE, nQuadro = FIRST_QUADRO, nCode = 1, index = 0;

for (const piece of PIECES) {
    for (const block of piece.blocks) {
        index += 1;
        block.index = index;
        if (block.type === "fig") { numbers.f[block.key] = nFig++; defined[`f:${block.key}`] = index; }
        if (["quadro", "dictionary", "scenarios"].includes(block.type)) { numbers.q[block.key] = nQuadro++; defined[`q:${block.key}`] = index; }
        if (["code", "sqlcode"].includes(block.type)) { numbers.c[block.key] = nCode++; defined[`c:${block.key}`] = index; }
    }
}

const LABEL = { f: "Figura", q: "Quadro", c: "Código" };

function resolve(text, blockIndex) {
    return text.replace(/\{([fqc]):(\w+)\}/g, (_, kind, key) => {
        const number = numbers[kind][key];
        if (number === undefined) throw new Error(`Referência sem destino: {${kind}:${key}}`);
        const id = `${kind}:${key}`;
        mentions[id] ??= blockIndex;
        return `${LABEL[kind]} ${number}`;
    });
}

// ------------------------------------------------------------------ utilitários de PNG e código
function pngSize(file) {
    const buffer = fs.readFileSync(file);
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), data: buffer };
}

const fileCache = {};
const linesOf = (rel) => (fileCache[rel] ??= fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^﻿/, "").split(/\r?\n/));

function extractBlock(lines, startIdx) {
    let depth = 0, opened = false;
    for (let i = startIdx; i < lines.length; i += 1) {
        for (const ch of lines[i]) {
            if (ch === "{") { depth += 1; opened = true; }
            if (ch === "}") depth -= 1;
        }
        if (opened && depth === 0) return i;
    }
    throw new Error("bloco não fechado");
}

function snippetLines(code) {
    const out = [];
    const ranges = [];
    const defaultFile = code.source.includes(" e ") ? null : code.source;

    for (const snippet of code.snippets) {
        if (snippet.text !== undefined) { out.push(snippet.text); continue; }
        const file = snippet.file ?? defaultFile;
        const lines = linesOf(file);
        let from, to;

        if (snippet.from) { from = snippet.from - 1; to = snippet.to - 1; }
        else {
            const start = lines.findIndex((l) => l.includes(snippet.startMarker));
            if (start < 0) throw new Error(`marcador não encontrado: ${snippet.startMarker}`);
            from = start;
            if (snippet.single) to = start;
            else if (snippet.blockFromMarker) to = extractBlock(lines, start);
            else {
                const end = lines.findIndex((l, i) => i > start && l.includes(snippet.endMarker));
                if (end < 0) throw new Error(`fim não encontrado: ${snippet.endMarker}`);
                to = snippet.endExclusive ? end - 1 : end;
            }
            if (snippet.withAttributes) from -= snippet.withAttributes;
        }
        for (let i = from; i <= to; i += 1) out.push(lines[i].replace(/\t/g, "    "));
        ranges.push({ file, from: from + 1, to: to + 1 });
    }

    // remove o recuo comum para o trecho caber na largura da página
    const indents = out.filter((l) => l.trim() !== "").map((l) => l.match(/^ */)[0].length);
    const common = Math.min(...indents);
    return { lines: out.map((l) => (l.trim() === "" ? "" : l.slice(common))), ranges };
}

// ------------------------------------------------------------------ elementos de texto
const run = (text, extra = {}) => new TextRun({ text, font: FONT, size: 24, ...extra });

const body = (text, extra = {}) => new Paragraph({
    children: [run(text)],
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 720 },
    spacing: { after: 200, line: 360 },
    ...extra,
});

function bodyWithLabel(text) {
    const m = text.match(/^(Palavras-chave:|Keywords:)(.*)$/s);
    if (!m) return body(text);
    return new Paragraph({
        children: [run(m[1], { bold: true }), run(m[2])],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200, line: 360 },
    });
}

const heading = (text, level) => {
    const size = level === HeadingLevel.HEADING_2 ? 28 : 24;
    return new Paragraph({
        heading: level,
        keepNext: true,
        spacing: { before: level === HeadingLevel.HEADING_1 ? 240 : 320, after: 220, line: 360 },
        children: [new TextRun({ text, font: FONT, size, bold: level !== HeadingLevel.HEADING_2 })],
    });
};

const caption = (text) => new Paragraph({ children: [run(text)], keepNext: true, spacing: { before: 200, after: 120, line: 360 } });
const source = (text = `Fonte: ${SRC}.`) => new Paragraph({
    children: [run(text, { italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 240 },
});

const border = (color = "808080", size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const allBorders = (color) => ({ top: border(color), bottom: border(color), left: border(color), right: border(color) });

function cell(text, width, { bold = false, shade, size = 20, align = AlignmentType.LEFT } = {}) {
    return new TableCell({
        width: { size: width, type: WidthType.DXA },
        borders: allBorders(),
        shading: shade ? { type: ShadingType.CLEAR, fill: shade, color: "auto" } : undefined,
        margins: { top: 60, bottom: 60, left: 90, right: 90 },
        children: String(text).split("\n").map((t) => new Paragraph({ alignment: align, spacing: { line: 240 }, children: [new TextRun({ text: t, font: FONT, size, bold })] })),
    });
}

function table(header, rows, widths, { size = 20, groupFirstCol = false } = {}) {
    return new Table({
        width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
        columnWidths: widths,
        layout: TableLayoutType.FIXED,
        rows: [
            new TableRow({ tableHeader: true, cantSplit: true, children: header.map((h, i) => cell(h, widths[i], { bold: true, shade: "D9D9D9", size })) }),
            ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i], { size, shade: groupFirstCol && i === 0 && c ? "F2F2F2" : undefined, bold: groupFirstCol && i === 0 && !!c })) })),
        ],
    });
}

function codeBox(lines, { size = 18 } = {}) {
    return new Table({
        width: { size: 9070, type: WidthType.DXA },
        columnWidths: [9070],
        layout: TableLayoutType.FIXED,
        rows: [new TableRow({
            children: [new TableCell({
                width: { size: 9070, type: WidthType.DXA },
                borders: allBorders("A6A6A6"),
                shading: { type: ShadingType.CLEAR, fill: "F5F5F5", color: "auto" },
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: lines.map((line) => new Paragraph({ spacing: { line: 240 }, children: [new TextRun({ text: line === "" ? " " : line, font: CODE_FONT, size })] })),
            })],
        })],
    });
}

// ------------------------------------------------------------------ renderização de blocos
const children = {}; // pieceId -> elementos
const wordCounts = [];
const listsToUpdate = { figuras: [], quadros: [], codigos: [] };

function render(block, piece) {
    const out = [];
    const text = (t) => resolve(t, block.index);

    switch (block.type) {
        case "h1": out.push(heading(text(block.text), HeadingLevel.HEADING_1)); break;
        case "h1plain": {
            const h = heading(block.text, HeadingLevel.HEADING_1);
            out.push(block.pageBreak ? new Paragraph({ pageBreakBefore: true, heading: HeadingLevel.HEADING_1, keepNext: true, spacing: { after: 220, line: 360 }, children: [new TextRun({ text: block.text, font: FONT, size: 24, bold: true })] }) : h);
            break;
        }
        case "psingle": {
            const m = block.text.match(/^(Palavras-chave:|Keywords:)(.*)$/s);
            wordCounts.push([block.text.slice(0, 20), block.text.trim().split(/\s+/).length]);
            out.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 200, line: 276 }, children: m ? [run(m[1], { bold: true }), run(m[2])] : [run(block.text)] }));
            break;
        }
        case "h2": out.push(heading(block.text, HeadingLevel.HEADING_2)); break;
        case "h3": out.push(heading(block.text, HeadingLevel.HEADING_3)); break;
        case "p": out.push(bodyWithLabel(text(block.text))); break;
        case "list":
            for (const item of block.items) {
                out.push(new Paragraph({ numbering: { reference: "bullets", level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 120, line: 320 }, children: [run(resolve(item, block.index))] }));
            }
            break;
        case "fig": {
            const number = numbers.f[block.key];
            const file = path.join(FIG_DIR, block.file);
            const { width, height, data } = pngSize(file);
            const w = Math.round(block.widthCm * CM);
            const h = Math.round((w * height) / width);
            out.push(caption(`Figura ${number} – ${block.title}`));
            out.push(new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { after: 0 }, children: [new ImageRun({ type: "png", data, transformation: { width: w, height: h }, altText: { title: block.title, description: block.title, name: block.file } })] }));
            out.push(source());
            listsToUpdate.figuras.push(`Figura ${number} - ${block.title}`);
            break;
        }
        case "quadro": {
            const number = numbers.q[block.key];
            out.push(caption(`Quadro ${number} – ${block.title}`));
            out.push(table(block.header, block.rows, block.widths));
            out.push(source());
            listsToUpdate.quadros.push(`Quadro ${number} – ${block.title}`);
            break;
        }
        case "dictionary": {
            const number = numbers.q[block.key];
            const rows = [];
            for (const t of model) {
                const fkOf = Object.fromEntries(t.fks.map((f) => [f.column, f.table]));
                const unique = new Set(t.indexes.filter((i) => i.unique && i.columns.length === 1).map((i) => i.columns[0]));
                t.columns.forEach((c, i) => {
                    const keys = [t.pk.includes(c.name) ? "PK" : null, fkOf[c.name] ? `FK → ${fkOf[c.name]}` : null, unique.has(c.name) ? "Único" : null].filter(Boolean).join(", ");
                    rows.push([i === 0 ? t.table : "", c.name, c.type, c.nullable ? "Não" : "Sim", keys]);
                });
            }
            out.push(caption(`Quadro ${number} – ${block.title}`));
            out.push(table(["Tabela", "Coluna", "Tipo", "Obrigatório", "Chave"], rows, [2350, 1850, 1450, 1250, 2170], { size: 18, groupFirstCol: true }));
            out.push(source());
            listsToUpdate.quadros.push(`Quadro ${number} – ${block.title}`);
            break;
        }
        case "scenarios": {
            const number = numbers.q[block.key];
            const rows = SCENARIOS.map(([id, name, steps, expected, test]) => [id, name, steps, expected, test, "Aprovado"]);
            out.push(caption(`Quadro ${number} – ${block.title}`));
            out.push(table(["ID", "Cenário", "Procedimento", "Resultado esperado", "Teste automatizado", "Resultado"], rows, [600, 1400, 2050, 1900, 2170, 950], { size: 16 }));
            out.push(source());
            listsToUpdate.quadros.push(`Quadro ${number} – ${block.title}`);
            break;
        }
        case "code": {
            const number = numbers.c[block.key];
            const { lines, ranges } = snippetLines(block);
            const byFile = new Map();
            for (const r of ranges) byFile.set(r.file, [...(byFile.get(r.file) ?? []), r.from === r.to ? `${r.from}` : `${r.from}–${r.to}`]);
            const cite = [...byFile].map(([file, parts]) => `${file} (linha${parts.length > 1 || parts[0].includes("–") ? "s" : ""} ${parts.length > 1 ? parts.slice(0, -1).join(", ") + " e " + parts.at(-1) : parts[0]})`);
            out.push(caption(`Código ${number} – ${block.title}`));
            out.push(codeBox(lines));
            out.push(source(`Fonte: ${SRC}, ${cite.length > 1 ? "arquivos" : "arquivo"} ${cite.join(" e ")}.`));
            listsToUpdate.codigos.push(`Código ${number} – ${block.title}`);
            break;
        }
        case "sqlcode": {
            const number = numbers.c[block.key];
            out.push(caption(`Código ${number} – ${block.title}`));
            out.push(codeBox(schemaSql.replace(/\n+$/, "").split("\n"), { size: 15 }));
            out.push(source(`Fonte: ${SRC}, a partir das migrações do Entity Framework Core.`));
            listsToUpdate.codigos.push(`Código ${number} – ${block.title}`);
            break;
        }
        case "glossary":
            out.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 160, line: 320 }, children: [run(block.term, { bold: true }), run(` – ${block.def}`)] }));
            break;
        case "lists-to-update":
            out.push(new Paragraph({ pageBreakBefore: false, children: [] }));
            out.push({ deferred: true });
            break;
        default: throw new Error(`bloco desconhecido: ${block.type}`);
    }
    return out;
}

for (const piece of PIECES) {
    children[piece.id] = piece.blocks.flatMap((block) => render(block, piece));
}

// ------------------------------------------------------------------ listas a atualizar (peça 0)
function listsParagraphs() {
    const items = (title, entries) => [
        new Paragraph({ spacing: { before: 200, after: 80 }, keepNext: true, children: [new TextRun({ text: title, font: FONT, size: 22, bold: true })] }),
        ...entries.map((e) => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: e, font: FONT, size: 20 })] })),
    ];
    return [
        heading("Linhas para acrescentar às listas do relatório", HeadingLevel.HEADING_3),
        body("Digite estas linhas no final da Lista de Figuras e da Lista de Quadros do relatório (a Figura 22 e o Quadro 16 continuam a numeração atual) e crie a nova Lista de Códigos logo depois da Lista de Quadros."),
        ...items("Lista de Figuras (acrescentar)", listsToUpdate.figuras),
        ...items("Lista de Quadros (acrescentar)", listsToUpdate.quadros),
        ...items("LISTA DE CÓDIGOS (nova lista)", listsToUpdate.codigos),
    ];
}
children[0] = children[0].flatMap((el) => (el && el.deferred ? listsParagraphs() : [el]));

// ------------------------------------------------------------------ verificações
const problems = [];
for (const [id, defIndex] of Object.entries(defined)) {
    const mention = mentions[id];
    if (mention === undefined) problems.push(`${id}: nunca citado no texto`);
    else if (mention > defIndex) problems.push(`${id}: citado só depois de aparecer`);
}
const expected = { previsto: 21, cenarios: 22, dicionario: 16 };
for (const [key, n] of Object.entries(expected)) if (numbers.q[key] !== n) problems.push(`quadro ${key} deveria ser ${n} e é ${numbers.q[key]}`);
if (numbers.f.der !== FIRST_FIGURE) problems.push("o DER deveria ser a primeira figura nova");
if (problems.length) { console.error("PROBLEMAS:\n - " + problems.join("\n - ")); process.exit(1); }

// ------------------------------------------------------------------ documento
const headerFor = (title) => new Header({
    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
        new TextRun({ text: `${title}    |    `, font: FONT, size: 18, color: "7F7F7F" }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 }),
    ] })],
});

const doc = new Document({
    creator: "Equipe Trilho",
    title: "Complemento do Relatório Final PIM III – Trilho",
    styles: {
        default: { document: { run: { font: FONT, size: 24 } } },
        paragraphStyles: [
            { id: "Heading1", name: "heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 24, bold: true }, paragraph: { keepNext: true } },
            { id: "Heading2", name: "heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 28 }, paragraph: { keepNext: true } },
            { id: "Heading3", name: "heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 24, bold: true }, paragraph: { keepNext: true } },
        ],
    },
    numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
    sections: PIECES.map((piece) => ({
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1701, left: 1701, right: 1134, bottom: 1134, header: 600 } } },
        headers: { default: headerFor(piece.title) },
        children: children[piece.id],
    })),
});

fs.writeFileSync(OUT, await Packer.toBuffer(doc));
console.log(`gerado: ${OUT}`);
console.log('palavras (resumo/abstract):', JSON.stringify(wordCounts));
console.log(`figuras ${FIRST_FIGURE}–${nFig - 1} | quadros ${FIRST_QUADRO}–${nQuadro - 1} | códigos 1–${nCode - 1}`);
