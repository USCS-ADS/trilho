# Apresentação final do Trilho

Slides da apresentação final: **7 min de fala + 3 min de perguntas**, 5 apresentadores. São 10 slides no tempo da fala
e 3 de reserva (modelo de dados, perguntas prováveis, celular), que só entram se perguntarem.
Cada slide tem o texto de fala completo nas anotações do orador, com quem fala e o tempo acumulado (≈ 6:40 a 135 palavras por minuto).

## Gerar
```bash
cd docs/apresentacao
npm install
NODE_PATH="$PWD/node_modules" node build.mjs
```
Saída em `saida/` (fora do Git): `Trilho-Apresentacao.pptx` e `roteiro-fala.md`.

- As capturas vêm de `docs/relatorio/figuras/`.
- O texto de fala fica em `falas.mjs`; o desenho dos slides, em `build.mjs`.
- `applyTheme` (cores do tema no arquivo) vem da skill `pptx`; se o caminho for outro, defina `PPTX_SKILL_DIR`.
