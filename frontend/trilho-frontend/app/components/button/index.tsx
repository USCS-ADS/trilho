import { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
    primary: "bg-trilho-accent text-white",
    secondary: "border border-trilho-border text-trilho-text hover:bg-trilho-surface-2",
};

/**
 * Classes de um botão do design system, na variante pedida. Usado pelo
 * `Button` (elemento `<button>`) e pelo `LinkButton` (link estilizado como
 * botão), pra manter os dois visualmente idênticos sem duplicar Tailwind.
 */
export function buttonVariantClasses(variant: ButtonVariant = "primary") {
    return `inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

export function Button({
    variant = "primary",
    className = "",
    children,
    ...props
}: ButtonProps) {
    return (
        <button className={`${buttonVariantClasses(variant)} ${className}`} {...props}>
            {children}
        </button>
    );
}
