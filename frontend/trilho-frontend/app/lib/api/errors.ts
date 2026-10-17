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
/** Respostas de 401/403/429 do ASP.NET (autenticação, políticas, rate limit) vêm sem corpo: damos um texto padrão. */
const DEFAULT_MESSAGES: Record<number, string> = {
    401: "Sua sessão expirou. Entre novamente.",
    403: "Você não tem permissão para realizar esta ação.",
    404: "Não encontramos o que você procura.",
    429: "Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.",
};

export function toUserMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.isNetworkError) {
            return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
        }
        if (error.status >= 500) return GENERIC_MESSAGE;
        if (error.messages.length > 0) return error.messages.join(" ");
        return DEFAULT_MESSAGES[error.status] ?? GENERIC_MESSAGE;
    }
    return GENERIC_MESSAGE;
}
