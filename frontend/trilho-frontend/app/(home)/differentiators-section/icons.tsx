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
