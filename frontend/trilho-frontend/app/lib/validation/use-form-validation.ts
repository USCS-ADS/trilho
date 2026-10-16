"use client";

import { useState } from "react";
import type * as z from "zod";
import { validate, type FieldErrors } from "./index";

/**
 * Validação de formulário no cliente com um schema zod.
 * `validateValues` devolve os dados tipados (ou `null` e popula `errors`);
 * `clearError` limpa o erro de um campo quando o usuário volta a editá-lo.
 */
export function useFormValidation<S extends z.ZodType>(schema: S) {
    const [errors, setErrors] = useState<FieldErrors>({});

    function validateValues(values: unknown): z.output<S> | null {
        const result = validate(schema, values);
        setErrors(result.success ? {} : result.errors);
        return result.success ? result.data : null;
    }

    function clearError(field: string) {
        setErrors((previous) => {
            if (!(field in previous)) return previous;
            return Object.fromEntries(Object.entries(previous).filter(([key]) => key !== field));
        });
    }

    return { errors, validateValues, clearError };
}
