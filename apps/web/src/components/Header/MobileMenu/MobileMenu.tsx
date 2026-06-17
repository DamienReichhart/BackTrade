import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "../../Button";
import { Icon } from "../../Icon";
import { useModalBehavior } from "../../../hooks/useModalBehavior";
import {
    navLinks,
    getNavLinkTo,
    scrollToSection,
    type NavLink,
} from "../Navigation/navConfig";
import styles from "./MobileMenu.module.css";

/**
 * Mobile navigation menu.
 *
 * Renders a hamburger toggle (shown only on small screens) and a slide-down
 * panel containing the primary nav links and auth actions. Reuses
 * useModalBehavior for Escape-to-close, scroll lock, focus trap, and focus
 * restore.
 */
export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const close = () => setIsOpen(false);
    const panelRef = useModalBehavior(isOpen, close);

    const handleLinkClick = (link: NavLink) => (e: React.MouseEvent) => {
        if (link.isHash && location.pathname === "/") {
            e.preventDefault();
            scrollToSection(link.label.toLowerCase());
        }
        close();
    };

    const goTo = (path: string) => () => {
        close();
        navigate(path);
    };

    return (
        <div className={styles.mobileMenu}>
            <button
                type="button"
                className={styles.toggle}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-menu-panel"
            >
                <Icon icon={isOpen ? X : Menu} size="md" />
            </button>

            {isOpen && (
                <>
                    <div className={styles.backdrop} onClick={close} />
                    <div
                        id="mobile-menu-panel"
                        ref={panelRef}
                        className={styles.panel}
                    >
                        <nav aria-label="Mobile">
                            <ul className={styles.list}>
                                {navLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={getNavLinkTo(link)}
                                            className={styles.link}
                                            onClick={handleLinkClick(link)}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <div className={styles.actions}>
                            <Button
                                variant="outline"
                                fullWidth
                                onClick={goTo("/signin")}
                            >
                                Sign in
                            </Button>
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={goTo("/signup")}
                            >
                                Get started
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
