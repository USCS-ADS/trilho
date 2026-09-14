const STEPS = [
    {
        title: "Crie tarefas e subtarefas",
        description:
            "Atribua a uma pessoa ou a um time inteiro, com prazo e descrição.",
    },
    {
        title: "Deixe a IA priorizar",
        description:
            "Receba sugestões de ordem de execução e responsável com base em dados reais.",
    },
    {
        title: "Acompanhe no Kanban",
        description:
            "O status avança automaticamente conforme commits, PRs e merges no seu repositório.",
    },
];

export function HowItWorksSection() {
    return (
        <section id="como-funciona" className="px-6 py-20">
            <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm font-medium uppercase tracking-wide text-trilho-accent">
                    Como funciona
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-trilho-text">
                    Do planejamento ao deploy, em três passos
                </h2>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-3">
                {STEPS.map((step, index) => (
                    <div key={step.title}>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-trilho-accent text-sm font-semibold text-trilho-accent">
                            {index + 1}
                        </span>
                        <h3 className="mt-4 font-semibold text-trilho-text">
                            {step.title}
                        </h3>
                        <p className="mt-2 text-sm text-trilho-dim">
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
