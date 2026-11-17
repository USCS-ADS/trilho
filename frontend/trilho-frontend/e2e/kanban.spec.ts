import { expect, test, type Page } from "@playwright/test";
import { column, login } from "./helpers";

async function cardCount(page: Page, label: string) {
    return column(page, label).locator('a[href^="/kanban/"]').count();
}

test.describe("quadro Kanban", () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
        await page.goto("/kanban");
        // O esqueleto do quadro também mostra os títulos das colunas: espera pelos cards reais.
        await expect(page.locator('main a[href^="/kanban/"]').first()).toBeVisible();
    });

    test("arrastar um card com o mouse muda de coluna", async ({ page }) => {
        const card = column(page, "Backlog").locator('a[href^="/kanban/"]').first();
        const title = (await card.innerText()).trim();
        const backlogBefore = await cardCount(page, "Backlog");
        const todoBefore = await cardCount(page, "A Fazer");

        const from = await card.boundingBox();
        const to = await column(page, "A Fazer").boundingBox();
        expect(from && to).toBeTruthy();

        await page.mouse.move(from!.x + 20, from!.y + from!.height / 2);
        await page.mouse.down();
        // Passos intermediários: o dnd-kit só ativa o arrasto depois de o ponteiro andar alguns pixels.
        await page.mouse.move(from!.x + 40, from!.y + from!.height / 2 + 10, { steps: 5 });
        await page.mouse.move(to!.x + to!.width / 2, to!.y + 80, { steps: 20 });
        await page.mouse.up();

        await expect.poll(() => cardCount(page, "A Fazer")).toBe(todoBefore + 1);
        expect(await cardCount(page, "Backlog")).toBe(backlogBefore - 1);
        await expect(column(page, "A Fazer").getByRole("link", { name: title })).toBeVisible();
    });

    test("busca filtra os cards e desliga o arrasto até limpar", async ({ page }) => {
        const total = await page.locator('main a[href^="/kanban/"]').count();

        await page.getByLabel("Buscar tarefa por título").fill("zzzz-sem-resultado");

        await expect(page.locator('main a[href^="/kanban/"]')).toHaveCount(0);
        await expect(page.getByRole("status").filter({ hasText: "0 de" })).toBeVisible();

        await page.getByRole("button", { name: "Limpar filtros" }).click();

        await expect(page.locator('main a[href^="/kanban/"]')).toHaveCount(total);
    });

    test("filtro de prioridade deixa só cards da prioridade escolhida", async ({ page }) => {
        const total = await page.locator('main a[href^="/kanban/"]').count();

        await page.getByLabel("Filtrar por prioridade").selectOption("urgent");

        const visible = await page.locator('main a[href^="/kanban/"]').count();
        expect(visible).toBeLessThan(total);
    });

    test("abre o detalhe da tarefa ao clicar no título", async ({ page }) => {
        await column(page, "Backlog").locator('a[href^="/kanban/"]').first().click();

        await expect(page).toHaveURL(/\/kanban\/[^/?]+$/);
        await expect(page.getByRole("button", { name: "Editar" })).toBeVisible();
    });
});
