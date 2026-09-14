import { ReactNode } from "react";
import { Logo } from "../logo";

interface AuthPanelProps {
    title: string;
    description: ReactNode;
}

/**
 * Painel de apresentação usado nas telas de autenticação (login, ativação de
 * conta, etc.): logo + título + descrição, sobre o fundo com gradiente da marca.
 */
export function AuthPanel({ title, description }: AuthPanelProps) {
    return (
        <section className="flex w-full flex-col justify-center gap-4 border-b-2 border-trilho-border bg-gradient-trilho-soft p-8 md:w-[45%] md:border-b-0 md:border-r-2">
            <Logo />
            <h1 className="text-2xl font-semibold text-trilho-text">{title}</h1>
            <p className="text-trilho-dim">{description}</p>
        </section>
    );
}
