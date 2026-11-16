# Vídeos do Trilho

Gera três vídeos de demonstração (curto ~3 min, médio ~6 min, longo ~10 min), cada um com voz sintética pt-BR + legendas e só com legendas
(para narrar depois), a partir do sistema real rodando com os dados da Nexus Advanced Analytics.

## Pré-requisitos
- API em `http://localhost:5018` apontando para um **banco descartável** (ex.: `ConnectionStrings__Connection` com `Database=trilhodb_video`), com
  `Settings__SeedAdmin__*` da Camila (`camila.duarte@nexusanalytics.example`, senha `Nexus@2026`) e `Settings__RateLimiting__AuthPermitLimit=500`.
- Dados carregados: `node docs/relatorio/scripts/report-seed.mjs`.
- Front em `http://localhost:3000` (`npm run dev`).
- Playwright e Chromium (já usados em `docs/relatorio`), ffmpeg (`winget install Gyan.FFmpeg`) e a voz *Microsoft Maria Desktop* do Windows.

## Uso
```bash
export API_LOG=<arquivo com o log da API>   # só a versão longa lê o código de redefinição de senha daqui
node docs/video/record.mjs medio            # curto | medio | longo (--dry só sintetiza e mede a voz)
node docs/video/build.mjs medio             # gera os MP4 (voz e só legendas) e o .srt
node docs/video/roteiros.mjs                # roteiros em Markdown para narrar
```
Saída em `docs/video/saida/` (fora do Git). `VOZ_RATE` muda a velocidade da voz (padrão 3); `AUDIO_OFFSET_MS` calibra o áudio (padrão -300).

O roteiro fica em `scenes.mjs` (texto por versão + ação na tela) e os cartões estáticos em `cards.mjs`.
