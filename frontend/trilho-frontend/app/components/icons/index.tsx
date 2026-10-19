import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps: IconProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
};

export function BoltIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
        </svg>
    );
}

export function UsersIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

export function GitBranchIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <line x1="6" x2="6" y1="3" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
    );
}

export function GridIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

export function ColumnsIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" x2="9" y1="3" y2="21" />
            <line x1="15" x2="15" y1="3" y2="21" />
        </svg>
    );
}

export function CheckSquareIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="m8 12 3 3 5-6" />
        </svg>
    );
}

export function XIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}

export function MenuIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
        </svg>
    );
}

export function LogOutIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
        </svg>
    );
}

export function PlusIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    );
}

export function ChevronDownIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

export function CheckIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

export function GearIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}

export function BellIcon(props: IconProps) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}
