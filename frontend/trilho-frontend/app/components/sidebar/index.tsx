"use client";

import { logout } from "@/app/lib/session/actions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentType, SVGProps } from "react";
import { Avatar } from "../avatar";
import { useCurrentUser } from "../current-user";
import {
    CheckSquareIcon,
    ColumnsIcon,
    GearIcon,
    GitBranchIcon,
    GridIcon,
    LogOutIcon,
    UsersIcon,
} from "../icons";
import { Logo } from "../logo";

interface SidebarNavItem {
    label: string;
    href: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    iconClassName: string;
}

const NAV_ITEMS: SidebarNavItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: GridIcon,
        iconClassName: "bg-trilho-accent/15 text-trilho-accent",
    },
    {
        label: "Kanban",
        href: "/kanban",
        icon: ColumnsIcon,
        iconClassName: "bg-trilho-warning/15 text-trilho-warning",
    },
    {
        label: "Times",
        href: "/times",
        icon: UsersIcon,
        iconClassName: "bg-trilho-accent-2/15 text-trilho-accent-2",
    },
    {
        label: "Tarefas",
        href: "/tarefas",
        icon: CheckSquareIcon,
        iconClassName: "bg-trilho-success/15 text-trilho-success",
    },
    {
        label: "Integrações Git",
        href: "/integracoes-git",
        icon: GitBranchIcon,
        iconClassName: "bg-trilho-surface-3 text-trilho-dim",
    },
    {
        label: "Configurações",
        href: "/configuracoes",
        icon: GearIcon,
        iconClassName: "bg-trilho-surface-3 text-trilho-dim",
    },
];

interface SidebarProps {
    /** Chamado ao clicar num item de navegação (ex: fechar o menu no mobile). */
    onNavigate?: () => void;
}

/** Navegação lateral das páginas autenticadas — compartilhada via `app/(app)/layout.tsx`. */
export function Sidebar({ onNavigate }: SidebarProps) {
    const pathname = usePathname();
    const currentUser = useCurrentUser();

    return (
        <aside className="flex h-full w-60 shrink-0 flex-col gap-1 border-r border-trilho-border bg-trilho-surface p-4">
            <Link
                href="/dashboard"
                onClick={onNavigate}
                className="mb-6 flex items-center gap-2 px-2"
            >
                <Logo size={32} />
                <span className="text-lg font-semibold text-trilho-text">Trilho</span>
            </Link>

            <nav aria-label="Navegação principal" className="flex flex-1 flex-col gap-1">
                {NAV_ITEMS.map(({ label, href, icon: Icon, iconClassName }) => {
                    const isActive = pathname === href || pathname.startsWith(`${href}/`);

                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onNavigate}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                                isActive
                                    ? "bg-trilho-surface-2 text-trilho-text"
                                    : "text-trilho-dim hover:bg-trilho-surface-2 hover:text-trilho-text"
                            }`}
                        >
                            <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${iconClassName}`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </span>
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {currentUser && (
                <div className="mt-4 flex items-center gap-3 border-t border-trilho-border pt-4">
                    <Avatar initials={currentUser.initials} />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-trilho-text">
                            {currentUser.name}
                        </p>
                        <form action={logout}>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-1 text-xs text-trilho-dim transition-colors hover:text-trilho-text"
                            >
                                <LogOutIcon className="h-3 w-3" />
                                Sair
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </aside>
    );
}
