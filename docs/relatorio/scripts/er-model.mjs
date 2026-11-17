// Extrai do snapshot do EF (a fonte de verdade do banco) as tabelas, colunas, chaves e relacionamentos.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const snapshot = path.join(here, "../../../backend/API/src/Trilho.Infrastructure/Migrations/TrilhoDbContextModelSnapshot.cs");
const text = fs.readFileSync(snapshot, "utf8");

const entities = {};
const blocks = text.split('modelBuilder.Entity("').slice(1);

for (const block of blocks) {
    const name = block.slice(0, block.indexOf('"'));
    const entity = (entities[name] ??= { name, table: null, columns: [], pk: [], indexes: [], fks: [] });

    for (const m of block.matchAll(/b\.Property<([^>]+)>\("(\w+)"\)([\s\S]*?);/g)) {
        const [, clr, column, chain] = m;
        if (entity.columns.some((c) => c.name === column)) continue;
        entity.columns.push({
            name: column,
            type: chain.match(/HasColumnType\("([^"]+)"\)/)?.[1] ?? clr,
            // string só é obrigatória com IsRequired(); tipos de valor são obrigatórios, salvo se terminarem em "?".
            nullable: clr.endsWith("?") || (clr === "string" && !chain.includes("IsRequired()")),
            auto: chain.includes("ValueGeneratedOnAdd"),
        });
    }

    const key = block.match(/b\.HasKey\(([^)]*)\)/);
    if (key) entity.pk = [...key[1].matchAll(/"(\w+)"/g)].map((x) => x[1]);

    const table = block.match(/b\.ToTable\("(\w+)"/);
    if (table) entity.table = table[1];

    for (const m of block.matchAll(/b\.HasIndex\(([^)]*)\)((?:\s*\.\w+\([^)]*\))*)/g)) {
        entity.indexes.push({ columns: [...m[1].matchAll(/"(\w+)"/g)].map((x) => x[1]), unique: m[2].includes("IsUnique") });
    }

    // Cada HasOne(...) é seguido de .WithMany(...).HasForeignKey("Coluna").OnDelete(...); a navegação pode ser null.
    const relation = /b\.HasOne\("([\w.]+)",\s*(?:"\w+"|null)\)\s*\.WithMany\([^)]*\)\s*\.HasForeignKey\("(\w+)"\)(?:\s*\.OnDelete\(DeleteBehavior\.(\w+)\))?/g;
    for (const m of block.matchAll(relation)) {
        entity.fks.push({ column: m[2], references: m[1], onDelete: m[3] ?? "Cascade" });
    }
}

const byEntity = Object.fromEntries(Object.values(entities).map((e) => [e.name, e]));
const model = Object.values(entities)
    .filter((e) => e.table)
    .map((e) => ({ ...e, fks: e.fks.map((f) => ({ ...f, table: byEntity[f.references]?.table ?? f.references })) }));

fs.mkdirSync(path.join(here, "../dados"), { recursive: true });
fs.writeFileSync(path.join(here, "../dados/modelo.json"), JSON.stringify(model, null, 2));
console.log(model.map((e) => `${e.table}: ${e.columns.length} colunas, ${e.fks.length} FKs`).join("\n"));
