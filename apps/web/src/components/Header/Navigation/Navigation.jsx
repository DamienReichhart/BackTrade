import { Link, useLocation } from "react-router-dom";
import styles from "./Navigation.module.css";

/**
 * Navigation links configuration
 */
const navLinks = [
  { label: "Product", to: "/", isHash: true },
  { label: "Interface", to: "/", isHash: true },
  { label: "Pricing", to: "/pricing" }
];

/**
 * Scroll to section if hash is present
 */
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Navigation component
 *
 * Displays main navigation links for the application
 */
export function Navigation() {
  const location = useLocation();

  const handleClick = link => e => {
    if (link.isHash) {
      const sectionId = link.label.toLowerCase();

      // If we're already on home page, just scroll
      if (location.pathname === "/") {
        e.preventDefault();
        scrollToSection(sectionId);
      }
      // If we're on another page, navigate to home and scroll after navigation
      // The Link component will handle the navigation
    }
  };

  return (
    <nav className={styles.navigation}>
      <ul className={styles.navList}>
        {navLinks.map(link => (
          <li key={link.label} className={styles.navItem}>
            {link.isHash ? (
              <Link
                to={`/#${link.label.toLowerCase()}`}
                className={styles.navLink}
                onClick={handleClick(link)}
              >
                {link.label}
              </Link>
            ) : (
              <Link to={link.to} className={styles.navLink}>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
