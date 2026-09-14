export interface NavLink {
    label: string;
    href: string;
}

/** Links do menu da landing page — compartilhados entre header e footer. */
export const NAV_LINKS: NavLink[] = [
    { label: "Recursos", href: "#recursos" },
    { label: "Diferenciais", href: "#diferenciais" },
    { label: "Como funciona", href: "#como-funciona" },
];
