import { InputHTMLAttributes } from "react";
import { controlClasses, FormField } from "../form-field";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
    name: string;
    label?: string;
    /** Mensagem de erro de validação; quando presente, o campo fica no estado inválido. */
    error?: string;
}

export function Input({ name, label, error, className = "", ...props }: InputProps) {
    return (
        <FormField name={name} label={label} error={error}>
            <input
                id={name}
                name={name}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${name}-error` : undefined}
                className={`${controlClasses(Boolean(error))} ${className}`}
                {...props}
            />
        </FormField>
    );
}
