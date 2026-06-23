import { Link, useLocation } from "react-router-dom";
import {
    navLinks,
    getNavLinkTo,
    scrollToSection,
    type NavLink,
} from "./navConfig";
import styles from "./Navigation.module.css";

/**
 * Navigation component
 *
 * Displays main navigation links for the application
 */
export function Navigation() {
    const location = useLocation();

    const handleClick = (link: NavLink) => (e: React.MouseEvent) => {
        // When already on the home page, scroll to the section instead of
        // navigating. Otherwise let the Link navigate to the hash target.
        if (link.isHash && location.pathname === "/") {
            e.preventDefault();
            scrollToSection(link.label.toLowerCase());
        }
    };

    return (
        <nav className={styles.navigation} aria-label="Primary">
            <ul className={styles.navList}>
                {navLinks.map((link) => (
                    <li key={link.label} className={styles.navItem}>
                        <Link
                            to={getNavLinkTo(link)}
                            className={styles.navLink}
                            onClick={
                                link.isHash ? handleClick(link) : undefined
                            }
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
