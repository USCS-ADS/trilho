export type ProgressTone = "danger" | "warning" | "accent" | "cyan" | "success";

const TONE_CLASSES: Record<ProgressTone, string> = {
    danger: "bg-trilho-danger",
    warning: "bg-trilho-warning",
    accent: "bg-trilho-accent",
    cyan: "bg-trilho-accent-2",
    success: "bg-trilho-success",
};

const SIZE_CLASSES = {
    sm: "h-1.5",
    md: "h-2",
} as const;

interface ProgressBarProps {
    /** Percentual de 0 a 100 (valores fora do intervalo são limitados). */
    value: number;
    tone?: ProgressTone;
    size?: keyof typeof SIZE_CLASSES;
    /** Descrição acessível do que está sendo medido. */
    label: string;
}

export function ProgressBar({ value, tone = "accent", size = "md", label }: ProgressBarProps) {
    const clamped = Math.min(100, Math.max(0, value));

    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clamped}
            className={`w-full overflow-hidden rounded-full bg-trilho-surface-2 ${SIZE_CLASSES[size]}`}
        >
            <div
                className={`h-full rounded-full transition-[width] ${TONE_CLASSES[tone]}`}
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
}
