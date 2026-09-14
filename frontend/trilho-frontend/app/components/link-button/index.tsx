import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";
import { ButtonVariant, buttonVariantClasses } from "../button";

type LinkButtonProps = LinkProps & {
    variant?: ButtonVariant;
    className?: string;
    children: ReactNode;
};

/** Link de navegação com a mesma aparência do `Button` — para CTAs que levam a outra rota/âncora, não a uma ação de formulário. */
export function LinkButton({
    variant = "primary",
    className = "",
    children,
    ...props
}: LinkButtonProps) {
    return (
        <Link className={`${buttonVariantClasses(variant)} ${className}`} {...props}>
            {children}
        </Link>
    );
}
