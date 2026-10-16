import { CheckIcon } from "../icons";

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
                        {step < currentStep ? (
                            <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                        ) : (
                            step
                        )}
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
