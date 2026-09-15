import { Logo } from "@/app/components/logo";
import { NAV_LINKS } from "@/app/nav-links";
import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="border-t border-trilho-border">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
                <div className="flex items-center gap-2">
                    <Logo size={28} />
                    <div>
                        <p className="text-sm font-semibold text-trilho-text">Trilho</p>
                        <p className="text-xs text-trilho-dim">
                            © {new Date().getFullYear()} Trilho — Gestão inteligente de
                            times e projetos de desenvolvimento.
                        </p>
                    </div>
                </div>

                <nav className="flex items-center gap-6">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-trilho-dim hover:text-trilho-text"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="/login"
                        className="text-sm text-trilho-dim hover:text-trilho-text"
                    >
                        Entrar
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
