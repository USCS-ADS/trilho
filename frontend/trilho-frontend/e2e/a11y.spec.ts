import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { DEMO_ADMIN_EMAIL, login } from "./helpers";

/**
 * Acessibilidade automática (RNF05, WCAG 2.1 nível AA) com o axe-core, em modo demonstração.
 * Cobre as regras que máquina consegue checar (contraste, rótulos, nomes acessíveis, ARIA, estrutura);
 * leitor de tela e navegação por teclado continuam exigindo teste manual.
 */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function audit(page: Page, scope?: string) {
    const builder = new AxeBuilder({ page }).withTags(TAGS);
    if (scope) builder.include(scope);
    const { violations } = await builder.analyze();

    const summary = violations.map(
        (v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`,
    );
    expect(summary, summary.join("\n")).toEqual([]);
}

test.describe("acessibilidade — telas", () => {
    test("login", async ({ page }) => {
        await page.goto("/login");
        await audit(page);
    });

    test.describe("autenticado como administrador", () => {
        test.beforeEach(async ({ page }) => {
            await login(page, DEMO_ADMIN_EMAIL);
        });

        for (const path of ["/dashboard", "/kanban", "/kanban/task-119", "/times", "/tarefas", "/integracoes-git", "/configuracoes"]) {
            test(path, async ({ page }) => {
                await page.goto(path);
                await expect(page.locator("h1")).toBeVisible();
                await page.waitForLoadState("networkidle");
                await audit(page);
            });
        }
    });
});

test.describe("acessibilidade — janelas modais", () => {
    test.beforeEach(async ({ page }) => {
        await login(page, DEMO_ADMIN_EMAIL);
    });

    test("nova tarefa", async ({ page }) => {
        await page.goto("/kanban");
        await page.getByRole("button", { name: "Nova tarefa" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await audit(page, "dialog");
    });

    test("gerenciar time", async ({ page }) => {
        await page.goto("/times");
        await page.getByRole("button", { name: /^Gerenciar o time / }).first().click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await audit(page, "dialog");
    });

    test("convidar usuário", async ({ page }) => {
        await page.goto("/configuracoes");
        await page.getByRole("button", { name: "Convidar usuário" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await audit(page, "dialog");
    });
});
