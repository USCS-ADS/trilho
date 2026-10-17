import { describe, expect, it } from "vitest";
import { ApiError, toUserMessage } from "./errors";

describe("toUserMessage", () => {
    it("mostra as mensagens de validação da API", () => {
        expect(toUserMessage(new ApiError(400, ["E-mail inválido.", "Senha fraca."]))).toBe(
            "E-mail inválido. Senha fraca.",
        );
    });

    it("usa texto padrão para respostas sem corpo (401, 403, 429)", () => {
        expect(toUserMessage(new ApiError(401, []))).toMatch(/sessão expirou/i);
        expect(toUserMessage(new ApiError(403, []))).toMatch(/permissão/i);
        expect(toUserMessage(new ApiError(429, []))).toMatch(/muitas tentativas/i);
    });

    it("não vaza detalhes de erro de servidor", () => {
        const message = toUserMessage(new ApiError(500, ["NullReferenceException em Foo.Bar"]));

        expect(message).not.toContain("NullReference");
    });

    it("explica falha de conexão (status 0)", () => {
        expect(toUserMessage(new ApiError(0, []))).toMatch(/conectar ao servidor/i);
    });

    it("trata erros desconhecidos com a mensagem genérica", () => {
        expect(toUserMessage(new Error("boom"))).toMatch(/tente novamente/i);
    });
});
