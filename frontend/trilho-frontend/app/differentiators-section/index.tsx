import { ComponentType, SVGProps } from "react";
import { BoltIcon, GitBranchIcon, UsersIcon } from "./icons";

interface Differentiator {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
}

const DIFFERENTIATORS: Differentiator[] = [
    {
        icon: BoltIcon,
        title: "Priorização por IA",
        description:
            "O Trilho analisa carga de trabalho, prazos e histórico de cada pessoa para sugerir automaticamente a ordem de execução e o responsável mais adequado.",
    },
    {
        icon: UsersIcon,
        title: "Hierarquia de times",
        description:
            "Crie quantos squads forem necessários, cada um com seu próprio líder, e acompanhe a carga de todos em um dashboard consolidado.",
    },
    {
        icon: GitBranchIcon,
        title: "Integração nativa com Git",
        description:
            "Vincule tarefas a branches e pull requests. O status avança sozinho conforme o código é revisado e mesclado — sem quadro manual.",
    },
];

export function DifferentiatorsSection() {
    return (
        <section id="diferenciais" className="px-6 py-20">
            <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm font-medium uppercase tracking-wide text-trilho-accent">
                    Diferenciais
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-trilho-text">
                    Feito para squads que não podem perder visibilidade
                </h2>
                <p className="mt-4 text-trilho-dim">
                    Diferente de quadros genéricos, o Trilho conecta o planejamento
                    das tarefas ao andamento real do código.
                </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
                {DIFFERENTIATORS.map(({ icon: Icon, title, description }) => (
                    <div
                        key={title}
                        className="rounded-xl border border-trilho-border bg-trilho-surface p-6"
                    >
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-trilho-accent/15 text-trilho-accent">
                            <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-trilho-text">{title}</h3>
                        <p className="mt-2 text-sm text-trilho-dim">{description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
