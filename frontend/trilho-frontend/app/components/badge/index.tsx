import { ReactNode } from "react";

export type BadgeTone = "danger" | "warning" | "neutral" | "info" | "accent" | "ai" | "success";

const TONE_CLASSES: Record<BadgeTone, string> = {
    danger: "bg-trilho-danger/15 text-trilho-danger-soft",
    warning: "bg-trilho-warning/15 text-trilho-warning",
    neutral: "bg-trilho-surface-3 text-trilho-dim",
    info: "bg-trilho-surface-3 text-trilho-text",
    accent: "bg-trilho-accent/15 text-trilho-accent-soft",
    ai: "bg-trilho-accent/15 text-trilho-accent-soft",
    success: "bg-trilho-success/15 text-trilho-success",
};

const SIZE_CLASSES = {
    xs: "text-[10px]",
    sm: "text-[11px]",
} as const;

interface BadgeProps {
    tone?: BadgeTone;
    size?: keyof typeof SIZE_CLASSES;
    icon?: ReactNode;
    children: ReactNode;
}

/** Selo curto de status/prioridade/etiqueta, com tom semântico do tema. */
export function Badge({ tone = "neutral", size = "sm", icon, children }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]}`}
        >
            {icon}
            {children}
        </span>
    );
}
