/**
 * Shared primary navigation configuration, used by both the desktop
 * Navigation and the mobile menu so the two never drift.
 */
export interface NavLink {
    label: string;
    to: string;
    isHash?: boolean;
}

export const navLinks: NavLink[] = [
    { label: "Product", to: "/", isHash: true },
    { label: "Interface", to: "/", isHash: true },
    { label: "Pricing", to: "/pricing" },
];

/** Resolve the router target for a nav link (hash links point at home sections). */
export function getNavLinkTo(link: NavLink): string {
    return link.isHash ? `/#${link.label.toLowerCase()}` : link.to;
}

/** Smooth-scroll to a section by id when already on the page that contains it. */
export function scrollToSection(id: string): void {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: "smooth" });
    }
}
