import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * E2E em modo demonstração (`USE_MOCK_API=true`): o Next sobe sozinho, sem API nem banco, então
 * os testes são determinísticos e rodam no CI. Cobrem a interação de interface (login, arrastar,
 * filtros, responsivo). A integração real front↔API é coberta pelos testes de integração do backend.
 */
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: "retain-on-failure",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: `npx next dev -p ${PORT}`,
        url: `http://localhost:${PORT}/login`,
        env: { USE_MOCK_API: "true" },
        reuseExistingServer: false,
        timeout: 120_000,
    },
});
