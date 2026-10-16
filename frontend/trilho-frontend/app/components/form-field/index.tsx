import { ReactNode } from "react";

interface FormFieldProps {
    /** Também é o `id` do controle e a base do id da mensagem de erro (`${name}-error`). */
    name: string;
    label?: string;
    error?: string;
    children: ReactNode;
}

/** Rótulo + controle + mensagem de erro, compartilhado por Input, Textarea e Select. */
export function FormField({ name, label, error, children }: FormFieldProps) {
    return (
        <fieldset className="mb-4">
            {label && (
                <label
                    htmlFor={name}
                    className="mb-2 block text-xs font-medium uppercase tracking-wide text-trilho-dim"
                >
                    {label}
                </label>
            )}
            {children}
            {error && (
                <p id={`${name}-error`} className="mt-1.5 text-xs text-trilho-danger">
                    {error}
                </p>
            )}
        </fieldset>
    );
}

/** Classes visuais comuns aos controles de formulário (campo de texto, área de texto, select). */
export function controlClasses(hasError: boolean) {
    return `w-full rounded-lg border bg-trilho-surface-2 p-2 text-trilho-text focus:outline-none disabled:cursor-not-allowed disabled:border-trilho-border disabled:bg-trilho-surface disabled:text-trilho-dim ${
        hasError
            ? "border-trilho-danger focus:border-trilho-danger"
            : "border-trilho-border focus:border-trilho-accent"
    }`;
}
