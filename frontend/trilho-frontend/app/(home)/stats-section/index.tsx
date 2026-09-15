const STATS = [
    { value: "4", label: "times, um único painel" },
    { value: "100%", label: "status sincronizado com o Git" },
    { value: "0", label: "atualizações manuais de quadro" },
    { value: "1", label: "líder por squad, visão consolidada" },
];

export function StatsSection() {
    return (
        <section className="border-y border-trilho-border py-12">
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 text-center sm:grid-cols-4">
                {STATS.map((stat) => (
                    <div key={stat.label}>
                        <p className="text-3xl font-semibold text-trilho-accent">
                            {stat.value}
                        </p>
                        <p className="mt-1 text-sm text-trilho-dim">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
