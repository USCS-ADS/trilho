# Apresentação final do Trilho

Duas versões dos slides da apresentação (7 min de fala + 3 de perguntas, 5 apresentadores):

1. **Modelo da disciplina (a versão para entregar):** preenche o `apresentacao-extensao.pptx` da professora, com os 8 slides e os tempos do roteiro
   (20/50/50/50/60/60/60/40 s). Cada slide leva o texto de fala completo nas anotações do orador, com quem fala.
2. **Versão anterior (própria):** 10 slides + 3 de reserva, em `build.mjs` e `falas.mjs`.

## Modelo da disciplina
```bash
cd docs/apresentacao
npm install
node assets.mjs          # logo, QR code do repositório e logos das tecnologias (img/)
# com a API em :5018 (banco descartável com a Nexus semeada por docs/relatorio/scripts/report-seed.mjs) e o front em :3000:
node capturas.mjs        # prints do slide 5 (img/dashboard.png, kanban.png, priorizacao.png)
node demo30.mjs          # vídeo curto do slide 6 (saida/demo-bruto.webm); corte com ffmpeg em saida/demo-trilho-30s.mp4
python preencher-modelo.py [caminho/apresentacao-extensao.pptx]
```
Saída em `saida/` (fora do Git): `Trilho-Apresentacao-modelo.pptx` e `roteiro-fala-modelo.md`.
O modelo padrão é lido de `Desktop\apresentacao-extensao.pptx`. O vídeo (≈ 23 s, sem voz) vai embutido no `.pptx`.

Os números dos slides vêm dos testes de verdade: backend 253 (`UseCases.Test` 86 + `WebApi.Test` 167), front 41 (Vitest) e 39 de ponta a ponta (Playwright), 333 no total.

## Versão anterior
```bash
NODE_PATH="$PWD/node_modules" node build.mjs    # saída: saida/Trilho-Apresentacao.pptx e saida/roteiro-fala.md
```
`applyTheme` (cores do tema no arquivo) vem da skill `pptx`; se o caminho for outro, defina `PPTX_SKILL_DIR`.
