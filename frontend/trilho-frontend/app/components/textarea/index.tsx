import { TextareaHTMLAttributes } from "react";
import { controlClasses, FormField } from "../form-field";

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
    name: string;
    label?: string;
    error?: string;
}

export function Textarea({ name, label, error, className = "", rows = 3, ...props }: TextareaProps) {
    return (
        <FormField name={name} label={label} error={error}>
            <textarea
                id={name}
                name={name}
                rows={rows}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${name}-error` : undefined}
                className={`${controlClasses(Boolean(error))} resize-y ${className}`}
                {...props}
            />
        </FormField>
    );
}
