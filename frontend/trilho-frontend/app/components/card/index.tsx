import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    /** Realça a borda com o ciano da marca (ex: caixas de sugestão da IA). */
    highlighted?: boolean;
    className?: string;
}

/** Painel de conteúdo padrão das páginas autenticadas. */
export function Card({ children, highlighted = false, className = "" }: CardProps) {
    return (
        <section
            className={`rounded-xl border bg-trilho-surface p-5 ${
                highlighted ? "border-trilho-accent-2" : "border-trilho-border"
            } ${className}`}
        >
            {children}
        </section>
    );
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <h2
            className={`mb-4 text-xs font-semibold uppercase tracking-wide text-trilho-dim ${className}`}
        >
            {children}
        </h2>
    );
}
