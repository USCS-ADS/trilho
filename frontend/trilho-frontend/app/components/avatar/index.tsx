const SIZE_CLASSES = {
    sm: "h-5 w-5 text-[10px] text-trilho-dim",
    md: "h-9 w-9 text-sm font-medium text-trilho-text",
} as const;

interface AvatarProps {
    initials: string;
    size?: keyof typeof SIZE_CLASSES;
}

/** Chip circular com as iniciais de uma pessoa. */
export function Avatar({ initials, size = "md" }: AvatarProps) {
    return (
        <span
            className={`flex shrink-0 items-center justify-center rounded-full bg-trilho-surface-3 ${SIZE_CLASSES[size]}`}
        >
            {initials}
        </span>
    );
}
