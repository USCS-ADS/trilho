// Gera o DDL final do banco (SHOW CREATE TABLE) a partir do banco em que as migrations foram aplicadas.
// A connection string vem da variável CS (nunca é impressa).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const here = path.dirname(fileURLToPath(import.meta.url));
const parts = Object.fromEntries(
    process.env.CS.split(";")
        .filter(Boolean)
        .map((p) => [p.slice(0, p.indexOf("=")).trim().toLowerCase(), p.slice(p.indexOf("=") + 1)]),
);
const connection = await mysql.createConnection({
    host: parts.server,
    port: Number(parts.port ?? 3306),
    user: parts.uid,
    password: parts.pwd,
    database: parts.database,
});

const order = ["Users", "Teams", "TeamMembers", "Tasks", "Subtasks", "TaskComments", "TaskActivities", "Invites", "PasswordResetRequests", "Notifications", "GitRepositories", "PendingGitEvents"];
const canonical = Object.fromEntries(order.map((t) => [t.toLowerCase(), t]));

const [rows] = await connection.query("SHOW TABLES");
const tables = rows
    .map((r) => Object.values(r)[0])
    .filter((t) => canonical[t.toLowerCase()])
    .sort((a, b) => order.indexOf(canonical[a.toLowerCase()]) - order.indexOf(canonical[b.toLowerCase()]));

let sql =
    "-- Esquema do banco do Trilho (MySQL 8) — gerado das migrations do Entity Framework Core.\n" +
    "-- Banco: trilhodb | charset utf8mb4\n\n" +
    "CREATE DATABASE IF NOT EXISTS trilhodb CHARACTER SET utf8mb4;\nUSE trilhodb;\n\n";

for (const table of tables) {
    const [[row]] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
    let ddl = row["Create Table"]
        .replace(/ AUTO_INCREMENT=\d+/, "")
        .replaceAll(" CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci", "")
        .replaceAll(" COLLATE utf8mb4_0900_ai_ci", "");

    // O MySQL no Windows grava os nomes em minúsculas; o esquema documentado usa a grafia do modelo (PascalCase).
    for (const [lower, name] of Object.entries(canonical)) {
        ddl = ddl.replaceAll("`" + lower + "`", "`" + name + "`");
    }
    sql += `${ddl};\n\n`;
}

fs.writeFileSync(path.join(here, "../dados/schema.sql"), sql);
console.log(tables.length, "tabelas,", sql.split("\n").length, "linhas");
await connection.end();
