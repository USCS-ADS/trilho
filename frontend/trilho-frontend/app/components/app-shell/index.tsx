"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { MenuIcon, XIcon } from "../icons";
import { Logo } from "../logo";
import { Sidebar } from "../sidebar";

/**
 * Casca das páginas autenticadas: sidebar fixa no desktop e menu em gaveta no
 * mobile (RNF04), com link "pular para o conteúdo" e landmark `<main>` (RNF05).
 */
export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    // A gaveta guarda *em qual rota* foi aberta; ao navegar, ela fecha sozinha.
    const [openOnPath, setOpenOnPath] = useState<string | null>(null);
    const isDrawerOpen = openOnPath === pathname;

    useEffect(() => {
        if (!isDrawerOpen) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpenOnPath(null);
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isDrawerOpen]);

    return (
        <div className="min-h-screen bg-trilho-bg md:flex">
            <a
                href="#conteudo"
                className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-trilho-accent-strong focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
            >
                Pular para o conteúdo
            </a>

            <div className="sticky top-0 hidden h-screen md:block">
                <Sidebar />
            </div>

            <div className="flex items-center justify-between border-b border-trilho-border bg-trilho-surface px-4 py-3 md:hidden">
                <div className="flex items-center gap-2">
                    <Logo size={28} />
                    <span className="font-semibold text-trilho-text">Trilho</span>
                </div>
                <button
                    type="button"
                    aria-label="Abrir menu"
                    aria-expanded={isDrawerOpen}
                    aria-controls="menu-lateral"
                    onClick={() => setOpenOnPath(pathname)}
                    className="rounded-md p-2 text-trilho-text hover:bg-trilho-surface-2"
                >
                    <MenuIcon className="h-5 w-5" />
                </button>
            </div>

            {isDrawerOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <button
                        type="button"
                        aria-label="Fechar menu"
                        onClick={() => setOpenOnPath(null)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <div id="menu-lateral" className="absolute inset-y-0 left-0 max-w-[85%]">
                        <Sidebar onNavigate={() => setOpenOnPath(null)} />
                        <button
                            type="button"
                            aria-label="Fechar menu"
                            onClick={() => setOpenOnPath(null)}
                            className="absolute right-2 top-2 rounded-md p-2 text-trilho-dim hover:bg-trilho-surface-2 hover:text-trilho-text"
                        >
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <main id="conteudo" className="min-w-0 flex-1">
                {children}
            </main>
        </div>
    );
}
