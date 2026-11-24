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

// Logo: quadrado arredondado com o degradê do sistema (#4F8CFF -> #22D3EE) e o "T" desenhado em formas (sem depender de fontes).
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="512" height="512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4F8CFF"/><stop offset="1" stop-color="#22D3EE"/></linearGradient></defs>
  <rect width="256" height="256" rx="56" fill="url(#g)"/>
  <rect x="62" y="60" width="132" height="38" rx="8" fill="#fff"/>
  <rect x="108" y="60" width="40" height="140" rx="8" fill="#fff"/>
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
