import { Link } from "react-router-dom";
import styles from "./Navigation.module.css";

/**
 * Navigation link interface
 */
interface NavLink {
  label: string;
  href: string;
}

/**
 * Navigation links configuration
 */
const navLinks: NavLink[] = [
  { label: "Product", href: "/#product" },
  { label: "Interface", href: "/#interface" },
  { label: "Pricing", href: "/pricing" },
];

/**
 * Navigation component
 * 
 * Displays main navigation links for the application
 */
export function Navigation() {
  return (
    <nav className={styles.navigation}>
      <ul className={styles.navList}>
        {navLinks.map((link) => (
          <li key={link.href} className={styles.navItem}>
            <a href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

