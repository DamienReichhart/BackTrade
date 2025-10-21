import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

/**
 * Footer links configuration
 */
const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Product", href: "/#product" },
  { label: "Interface", href: "/#interface" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" }
];

/**
 * Footer component
 *
 * Provides footer navigation and copyright information
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <nav className={styles.navigation}>
          <ul className={styles.linkList}>
            {footerLinks.map(link => (
              <li key={link.href} className={styles.linkItem}>
                <Link to={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.copyright}>
          <p>© {currentYear} BackTrade</p>
        </div>
      </div>
    </footer>
  );
}
