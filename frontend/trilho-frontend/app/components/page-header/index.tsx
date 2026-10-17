"use client";

import { ReactNode } from "react";
import { Avatar } from "../avatar";
import { useCurrentUser } from "../current-user";
import { NotificationBell } from "../notifications";

interface PageHeaderProps {
    title: string;
    /** Subtítulo; aceita nó pra permitir breadcrumb com links. */
    description?: ReactNode;
    /** Conteúdo extra entre o texto e o avatar (ex: um badge de time). */
    actions?: ReactNode;
}

/** Cabeçalho das páginas autenticadas: título/subtítulo + avatar do usuário logado. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
    const currentUser = useCurrentUser();

    return (
        <header className="flex items-start justify-between gap-4 border-b border-trilho-border px-4 py-5 sm:px-8 sm:py-6">
            <div className="min-w-0">
                <h1 className="text-xl font-semibold text-trilho-text">{title}</h1>
                {description && (
                    <div className="mt-1 text-sm text-trilho-dim">{description}</div>
                )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
                {actions}
                <NotificationBell />
                <Avatar initials={currentUser?.initials ?? "US"} />
            </div>
        </header>
    );
}
