import { describe, expect, it } from "vitest";
import { validate } from "@/app/lib/validation";
import { changePasswordSchema, createUserSchema } from "./schema";

describe("createUserSchema", () => {
    const valid = { name: "Pessoa Direta", email: "Pessoa@Trilho.local", password: "Direta@2026", role: "member" };

    it("aceita dados válidos", () => {
        expect(validate(createUserSchema([]), valid).success).toBe(true);
    });

    it("recusa e-mail já cadastrado sem diferenciar caixa", () => {
        const result = validate(createUserSchema(["pessoa@trilho.local"]), valid);

        expect(result.success).toBe(false);
        if (!result.success) expect(result.errors.email).toMatch(/já está cadastrado/i);
    });

    it("recusa senha que não cumpre as regras", () => {
        const result = validate(createUserSchema([]), { ...valid, password: "fraca" });

        expect(result.success).toBe(false);
        if (!result.success) expect(result.errors.password).toBeDefined();
    });

    it("recusa perfil desconhecido", () => {
        expect(validate(createUserSchema([]), { ...valid, role: "root" }).success).toBe(false);
    });
});

describe("changePasswordSchema", () => {
    const valid = { currentPassword: "Antiga@2026", newPassword: "Nova@20267", confirmation: "Nova@20267" };

    it("aceita a troca válida", () => {
        expect(validate(changePasswordSchema, valid).success).toBe(true);
    });

    it("exige a senha atual", () => {
        const result = validate(changePasswordSchema, { ...valid, currentPassword: "" });

        expect(result.success).toBe(false);
        if (!result.success) expect(result.errors.currentPassword).toMatch(/senha atual/i);
    });

    it("exige confirmação igual à nova senha", () => {
        const result = validate(changePasswordSchema, { ...valid, confirmation: "Outra@20267" });

        expect(result.success).toBe(false);
        if (!result.success) expect(result.errors.confirmation).toMatch(/não coincidem/i);
    });

    it("recusa nova senha igual à atual", () => {
        const result = validate(changePasswordSchema, {
            currentPassword: "Antiga@2026",
            newPassword: "Antiga@2026",
            confirmation: "Antiga@2026",
        });

        expect(result.success).toBe(false);
        if (!result.success) expect(result.errors.newPassword).toMatch(/diferente/i);
    });
});
