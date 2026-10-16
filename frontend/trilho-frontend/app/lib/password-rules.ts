export interface PasswordRule {
    id: string;
    label: string;
    test: (value: string) => boolean;
}

/** Caracteres especiais aceitos pelo backend (`PasswordValidator.cs`). */
export const SPECIAL_CHARACTERS = "!?*.&$#@";

/**
 * Regras de senha. Espelham o `PasswordValidator` do backend (que é a fonte de
 * verdade e é mais estrito que o RF01: exige também minúscula e restringe os
 * especiais). A UI (checklist) e os schemas zod consomem esta lista.
 */
export const PASSWORD_RULES: PasswordRule[] = [
    { id: "min-length", label: "Mínimo de 8 caracteres", test: (value) => value.length >= 8 },
    { id: "uppercase", label: "Ao menos uma letra maiúscula", test: (value) => /[A-Z]/.test(value) },
    { id: "lowercase", label: "Ao menos uma letra minúscula", test: (value) => /[a-z]/.test(value) },
    { id: "number", label: "Ao menos um número", test: (value) => /\d/.test(value) },
    {
        id: "special",
        label: `Ao menos um caractere especial (${SPECIAL_CHARACTERS.split("").join(" ")})`,
        test: (value) => [...SPECIAL_CHARACTERS].some((character) => value.includes(character)),
    },
];

export function isPasswordValid(value: string) {
    return PASSWORD_RULES.every((rule) => rule.test(value));
}
