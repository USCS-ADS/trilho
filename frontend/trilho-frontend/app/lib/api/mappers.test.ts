import { describe, expect, it } from "vitest";
import { initialsOf, roleFromApi, roleToApi, userFromApi } from "./mappers";

describe("perfis", () => {
    it("traduz os perfis da API para os do front", () => {
        expect(roleFromApi("administrador")).toBe("admin");
        expect(roleFromApi("lider")).toBe("leader");
        expect(roleFromApi("user")).toBe("member");
    });

    it("ignora caixa e espaços", () => {
        expect(roleFromApi("  Administrador ")).toBe("admin");
    });

    it("trata perfil desconhecido como o de menor privilégio", () => {
        expect(roleFromApi("root")).toBe("member");
        expect(roleFromApi("")).toBe("member");
    });

    it("ida e volta preserva o perfil", () => {
        for (const role of ["admin", "leader", "member"] as const) {
            expect(roleFromApi(roleToApi(role))).toBe(role);
        }
    });
});

describe("initialsOf", () => {
    it("usa a primeira e a última palavra do nome", () => {
        expect(initialsOf("Maria da Silva Santos")).toBe("MS");
    });

    it("usa as duas primeiras letras de um nome só", () => {
        expect(initialsOf("vitor")).toBe("VI");
    });

    it("tem valor padrão para nome vazio", () => {
        expect(initialsOf("   ")).toBe("US");
    });
});

describe("userFromApi", () => {
    const dto = { id: 7, name: "Bia Membro", email: "bia@trilho.local", role: "user" };

    it("converte id numérico em texto e calcula as iniciais", () => {
        expect(userFromApi(dto)).toMatchObject({ id: "7", initials: "BM", role: "member" });
    });

    it("considera ativo quando a API não informa isActive", () => {
        expect(userFromApi(dto).isActive).toBe(true);
    });

    it("respeita usuário desativado", () => {
        expect(userFromApi({ ...dto, isActive: false }).isActive).toBe(false);
    });
});
