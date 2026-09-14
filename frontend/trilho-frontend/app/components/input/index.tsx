import { InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
    name: string;
    label?: string;
}

export function Input({ name, label, className = "", ...props }: InputProps) {
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
            <input
                id={name}
                name={name}
                className={`w-full rounded-lg border border-trilho-border bg-trilho-surface-2 p-2 text-trilho-text focus:border-trilho-accent focus:outline-none disabled:cursor-not-allowed disabled:border-trilho-border disabled:bg-trilho-surface disabled:text-trilho-dim ${className}`}
                {...props}
            />
        </fieldset>
    );
}
