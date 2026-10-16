import { ReactNode } from "react";

interface EmptyStateProps {
    title: string;
    description?: string;
    /** Ação principal (ex: voltar, tentar novamente). */
    action?: ReactNode;
}

/** Bloco centralizado para estados sem conteúdo: erro, 404, listas vazias. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
    return (
        <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
            <h1 className="text-xl font-semibold text-trilho-text">{title}</h1>
            {description && <p className="mt-2 text-sm text-trilho-dim">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
