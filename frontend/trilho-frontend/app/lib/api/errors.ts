/** Erro devolvido pela API (`{ errorMessages: string[] }`) ou falha de conexão (status 0). */
export class ApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly messages: string[],
    ) {
        super(messages[0] ?? "Erro ao comunicar com o servidor.");
        this.name = "ApiError";
    }

    get isNetworkError() {
        return this.status === 0;
    }
}

const GENERIC_MESSAGE = "Não foi possível concluir a operação. Tente novamente em instantes.";

/** Texto seguro para exibir ao usuário a partir de qualquer erro capturado. */
export function toUserMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.isNetworkError) {
            return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
        }
        if (error.status >= 500) return GENERIC_MESSAGE;
        return error.messages.join(" ");
    }
    return GENERIC_MESSAGE;
}
