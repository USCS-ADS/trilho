import { SelectHTMLAttributes } from "react";
import { controlClasses, FormField } from "../form-field";
import { ChevronDownIcon } from "../icons";

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "children"> {
    name: string;
    label?: string;
    error?: string;
    options: SelectOption[];
    /** Texto da opção vazia inicial (ex: "Selecione um líder"). Sem ele, não há opção vazia. */
    placeholder?: string;
}

export function Select({
    name,
    label,
    error,
    options,
    placeholder,
    className = "",
    ...props
}: SelectProps) {
    return (
        <FormField name={name} label={label} error={error}>
            <div className="relative">
                <select
                    id={name}
                    name={name}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${name}-error` : undefined}
                    className={`${controlClasses(Boolean(error))} appearance-none pr-9 ${className}`}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-trilho-dim" />
            </div>
        </FormField>
    );
}
