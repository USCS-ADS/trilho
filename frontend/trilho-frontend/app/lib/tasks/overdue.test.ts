import { describe, expect, it } from "vitest";
import { isOverdue } from "./overdue";

describe("isOverdue", () => {
    const today = "2026-10-17";

    it("marca como atrasada a tarefa aberta com prazo vencido", () => {
        expect(isOverdue({ status: "in-progress", dueDate: "2026-10-16" }, today)).toBe(true);
    });

    it("não marca o prazo de hoje nem o futuro", () => {
        expect(isOverdue({ status: "todo", dueDate: today }, today)).toBe(false);
        expect(isOverdue({ status: "todo", dueDate: "2026-10-18" }, today)).toBe(false);
    });

    it("nunca marca tarefa concluída", () => {
        expect(isOverdue({ status: "done", dueDate: "2026-01-01" }, today)).toBe(false);
    });

    it("ignora tarefa sem prazo", () => {
        expect(isOverdue({ status: "todo", dueDate: undefined }, today)).toBe(false);
    });
});
