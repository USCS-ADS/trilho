import Link from "next/link";
import { Logo } from "../components/logo";
import { LinkButton } from "../components/link-button";
import { NAV_LINKS } from "../nav-links";

export function SiteHeader() {
    return (
        <header className="border-b border-trilho-border">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
                <Link href="/" className="flex items-center gap-2">
                    <Logo size={32} />
                    <span className="text-lg font-semibold text-trilho-text">Trilho</span>
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-trilho-dim hover:text-trilho-text"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm text-trilho-dim hover:text-trilho-text"
                    >
                        Entrar
                    </Link>
                    {/* TODO: apontar para a rota de cadastro quando ela existir */}
                    <LinkButton href="#" className="text-sm">
                        Começar agora
                    </LinkButton>
                </div>
            </div>
        </header>
    );
}
