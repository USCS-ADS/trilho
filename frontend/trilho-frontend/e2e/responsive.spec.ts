import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test.use({ viewport: { width: 375, height: 812 } });

for (const path of ["/dashboard", "/kanban", "/times", "/tarefas", "/integracoes-git", "/configuracoes"]) {
    test(`${path} não tem rolagem horizontal no celular`, async ({ page }) => {
        await login(page);
        await page.goto(path);

        await expect(page.locator("h1")).toHaveCount(1);

        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
    });
}
