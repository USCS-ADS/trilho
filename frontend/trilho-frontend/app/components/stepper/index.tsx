interface StepperProps {
    totalSteps: number;
    /** Passo atual, 1-indexado. Passos anteriores aparecem concluídos. */
    currentStep: number;
}

/** Indicador de progresso para fluxos em múltiplas etapas (ex: recuperação de senha). */
export function Stepper({ totalSteps, currentStep }: StepperProps) {
    const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

    return (
        <div className="mb-8 flex items-center">
            {steps.map((step) => (
                <div key={step} className="flex flex-1 items-center last:flex-none">
                    <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                            step < currentStep
                                ? "border-trilho-success text-trilho-success"
                                : step === currentStep
                                  ? "border-trilho-accent text-trilho-accent"
                                  : "border-trilho-border text-trilho-dim"
                        }`}
                    >
                        {step < currentStep ? <CheckIcon /> : step}
                    </span>

                    {step < totalSteps && (
                        <span
                            className={`mx-2 h-px flex-1 ${
                                step < currentStep ? "bg-trilho-success" : "bg-trilho-border"
                            }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

function CheckIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}
