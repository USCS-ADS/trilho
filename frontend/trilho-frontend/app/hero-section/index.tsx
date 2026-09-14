import { LinkButton } from "../components/link-button";
import { ProductPreview } from "./product-preview";

export function HeroSection() {
    return (
        <section id="recursos" className="px-6 py-20 text-center">
            <div className="mx-auto max-w-3xl">
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-trilho-border px-4 py-1 text-xs text-trilho-accent">
                    <span className="h-1.5 w-1.5 rounded-full bg-trilho-accent" />
                    Gestão de times de desenvolvimento
                </span>

                <h1 className="text-4xl font-semibold text-trilho-text sm:text-5xl">
                    Visibilidade real sobre o trabalho do seu{" "}
                    <span className="text-trilho-accent">time de engenharia</span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-trilho-dim">
                    O Trilho centraliza times, tarefas e subtarefas em um Kanban
                    colaborativo, com priorização assistida por IA e status
                    sincronizado automaticamente com o seu repositório Git.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    {/* TODO: apontar para a rota de cadastro quando ela existir */}
                    <LinkButton href="#">Começar agora</LinkButton>
                    <LinkButton href="#como-funciona" variant="secondary">
                        Ver como funciona
                    </LinkButton>
                </div>

                <p className="mt-4 text-xs text-trilho-dim-2">
                    Sem necessidade de cartão de crédito · Convide seu time em
                    minutos
                </p>
            </div>

            <ProductPreview />
        </section>
    );
}
