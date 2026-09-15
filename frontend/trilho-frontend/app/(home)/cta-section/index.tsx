import { LinkButton } from "@/app/components/link-button";

export function CtaSection() {
    return (
        <section className="px-6 py-12">
            <div className="mx-auto max-w-4xl rounded-2xl border border-trilho-border bg-trilho-surface px-8 py-12 text-center">
                <h2 className="text-2xl font-semibold text-trilho-text">
                    Pronto para dar previsibilidade ao seu time?
                </h2>
                <p className="mt-2 text-trilho-dim">
                    Convide seus squads, conecte o repositório e comece a
                    acompanhar tudo em um só lugar.
                </p>

                <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    {/* TODO: apontar para a rota de cadastro quando ela existir */}
                    <LinkButton href="#">Criar conta grátis</LinkButton>
                    {/* TODO: apontar para um canal de contato real (e-mail, formulário) */}
                    <LinkButton href="#" variant="secondary">
                        Falar com o time
                    </LinkButton>
                </div>
            </div>
        </section>
    );
}
