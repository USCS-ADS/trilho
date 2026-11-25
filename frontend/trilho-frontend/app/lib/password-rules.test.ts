import { describe, expect, it } from "vitest";
import { isPasswordValid, PASSWORD_RULES } from "./password-rules";

describe("isPasswordValid", () => {
    it("aceita uma senha que cumpre todas as regras do backend", () => {
        expect(isPasswordValid("Trilho@2026")).toBe(true);
    });

    it.each([
        ["curta demais", "Ab1@"],
        ["sem maiúscula", "trilho@2026"],
        ["sem minúscula", "TRILHO@2026"],
        ["sem número", "Trilho@Trilho"],
        ["sem caractere especial", "Trilho2026"],
        ["com especial fora da lista do backend", "Trilho-2026"],
    ])("recusa senha %s", (_, password) => {
        expect(isPasswordValid(password)).toBe(false);
    });

    it("tem uma regra por exigência do PasswordValidator", () => {
        expect(PASSWORD_RULES.map((rule) => rule.id)).toEqual([
            "min-length",
            "uppercase",
            "lowercase",
            "number",
            "special",
        ]);
    });
});
