// Gera as imagens do modelo da disciplina: logo do Trilho, QR code do repositório e logos das tecnologias.
// Saída: img/logo-trilho.png, img/qr-repositorio.png, img/tec-*.png. Uso: node assets.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import QRCode from "qrcode";
import * as si from "react-icons/si";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "img");
fs.mkdirSync(OUT, { recursive: true });

// Logo igual ao do site: quadrado arredondado azul liso (#4F8CFF) com o "T" escuro (#0B1020), desenhado em formas (sem depender de fontes).
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="512" height="512">
  <rect width="256" height="256" rx="52" fill="#4F8CFF"/>
  <rect x="62" y="64" width="132" height="36" rx="8" fill="#0B1020"/>
  <rect x="108" y="64" width="40" height="132" rx="8" fill="#0B1020"/>
</svg>`;
await sharp(Buffer.from(logo)).png().toFile(path.join(OUT, "logo-trilho.png"));

// QR code do repositório público (azul-petróleo do modelo sobre branco).
await QRCode.toFile(path.join(OUT, "qr-repositorio.png"), "https://github.com/USCS-ADS/trilho", {
    width: 600,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0B5563", light: "#FFFFFF" },
});

// Logos das tecnologias (react-icons, cores oficiais das marcas).
const techs = [
    ["nextjs", "SiNextdotjs", "000000"],
    ["react", "SiReact", "61DAFB"],
    ["typescript", "SiTypescript", "3178C6"],
    ["tailwind", "SiTailwindcss", "06B6D4"],
    ["dotnet", "SiDotnet", "512BD4"],
    ["mysql", "SiMysql", "4479A1"],
    ["docker", "SiDocker", "2496ED"],
    ["actions", "SiGithubactions", "2088FF"],
];
for (const [name, icon, color] of techs) {
    const svg = renderToStaticMarkup(React.createElement(si[icon], { color: `#${color}`, size: 256 }));
    await sharp(Buffer.from(svg)).resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(OUT, `tec-${name}.png`));
}
console.log("imagens geradas em", OUT);
