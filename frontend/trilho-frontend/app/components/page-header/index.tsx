import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    /** Conteúdo extra entre o texto e o avatar (ex: um badge de time). */
    actions?: ReactNode;
    /** Iniciais exibidas no avatar. Ver TODO no chamador — hoje é sempre um valor genérico. */
    userInitials?: string;
}

/** Cabeçalho reaproveitado entre as páginas autenticadas: título/subtítulo + avatar do usuário. */
export function PageHeader({
    title,
    description,
    actions,
    userInitials = "US",
}: PageHeaderProps) {
    return (
        <header className="flex items-start justify-between border-b border-trilho-border px-8 py-6">
            <div>
                <h1 className="text-xl font-semibold text-trilho-text">{title}</h1>
                {description && (
                    <p className="mt-1 text-sm text-trilho-dim">{description}</p>
                )}
            </div>

            <div className="flex items-center gap-3">
                {actions}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-trilho-surface-3 text-sm font-medium text-trilho-text">
                    {userInitials}
                </span>
            </div>
        </header>
    );
}
