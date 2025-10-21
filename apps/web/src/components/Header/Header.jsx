import { Link, useNavigate } from "react-router-dom";
import { Button } from "../Button/index.jsx";
import { Navigation } from "./Navigation/index.jsx";
import styles from "./Header.module.css";
import logoSvg from "../../assets/logo.svg";

/**
 * Main header component with logo and navigation
 *
 * Provides the primary navigation and branding for the application
 * Responsive design with mobile menu support
 */
export function Header() {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Logo */}
          <Link to='/' className={styles.logoLink}>
            <img src={logoSvg} alt='BackTrade' className={styles.logo} />
            <span className={styles.brandName}>BackTrade</span>
          </Link>

          {/* Navigation */}
          <Navigation />

          {/* Actions */}
          <div className={styles.actions}>
            <Button
              variant='ghost'
              size='medium'
              onClick={() => navigate("/signin")}
            >
              Sign in
            </Button>
            <Button
              variant='primary'
              size='medium'
              onClick={() => navigate("/signup")}
            >
              Get started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
