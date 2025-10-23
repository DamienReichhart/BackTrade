import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { Checkbox } from "../../../../components/Checkbox";
import logoSvg from "../../../../assets/logo.svg";
import styles from "./LoginFormPanel.module.css";

/**
 * Login form panel component
 *
 * Displays the login form on the right side with email/password inputs,
 * SSO, and magic link options
 */
export function LoginFormPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>("Enter a valid email.");
  const [passwordError, setPasswordError] = useState<string | undefined>("Minimum 8 characters.");

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password, rememberDevice });
  };

  /**
   * Handle email input change
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Validate email
    if (value.length === 0) {
      setEmailError("Enter a valid email.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Enter a valid email.");
    } else {
      setEmailError(undefined);
    }
  };

  /**
   * Handle password input change
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Validate password
    if (value.length === 0) {
      setPasswordError("Minimum 8 characters.");
    } else if (value.length < 8) {
      setPasswordError("Minimum 8 characters.");
    } else {
      setPasswordError(undefined);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.formContainer}>
        {/* Header */}
        <div className={styles.formHeader}>
          <div className={styles.formLabel}>SIGN IN</div>
          <div className={styles.logoContainer}>
            <img src={logoSvg} alt="BackTrade" className={styles.logo} />
            <span className={styles.brandName}>BackTrade</span>
          </div>
          <div className={styles.secureBadge}>SECURE AREA</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email Input */}
          <Input
            label="Email"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={handleEmailChange}
            error={emailError}
            hasError={!!emailError}
          />

          {/* Password Input */}
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            error={passwordError}
            hasError={!!passwordError}
          />

          {/* Remember Device & Forgot Password */}
          <div className={styles.formOptions}>
            <Checkbox
              label="Remember this device"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
            />
            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            className={styles.submitButton}
          >
            Continue
          </Button>

          {/* Separator */}
          <div className={styles.separator}>
            <span>or</span>
          </div>

          {/* Alternative Login Options */}
          <div className={styles.alternativeOptions}>
            <Button
              type="button"
              variant="secondary"
              size="medium"
              onClick={() => console.log("SSO login")}
            >
              SSO
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="medium"
              onClick={() => console.log("Magic link login")}
            >
              Magic link
            </Button>
          </div>

          {/* Footer Links */}
          <div className={styles.formFooter}>
            <Link to="/signup" className={styles.signupLink}>
              New here? Create an account
            </Link>
            <div className={styles.footerLinks}>
              <Link to="/terms">Terms</Link>
              <span className={styles.separator}>•</span>
              <Link to="/privacy">Privacy</Link>
              <span className={styles.separator}>•</span>
              <span className={styles.euReady}>EU-ready</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

