import { useState } from "react";
import { Button } from "../../../../../components/Button";
import { Input } from "../../../../../components/Input";
import { Checkbox } from "../../../../../components/Checkbox";
import {
  FormHeader,
  AlternativeOptions,
  FormFooter,
} from "../../../components";
import styles from "./RegisterFormPanel.module.css";

/**
 * Register form panel component
 *
 * Displays the registration form on the right side with name, email, password,
 * and terms acceptance fields
 */
export function RegisterFormPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>(
    "Enter your name.",
  );
  const [emailError, setEmailError] = useState<string | undefined>(
    "Enter a valid email.",
  );
  const [passwordError, setPasswordError] = useState<string | undefined>(
    "Minimum 8 characters.",
  );
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | undefined
  >("Passwords must match.");

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration logic
  };

  /**
   * Handle name input change
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    if (value.length === 0) {
      setNameError("Enter your name.");
    } else if (value.length < 2) {
      setNameError("Name must be at least 2 characters.");
    } else {
      setNameError(undefined);
    }
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

    // Validate password match if confirm password has value
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords must match.");
    } else if (confirmPassword && value === confirmPassword) {
      setConfirmPasswordError(undefined);
    }
  };

  /**
   * Handle confirm password input change
   */
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value !== password) {
      setConfirmPasswordError("Passwords must match.");
    } else {
      setConfirmPasswordError(undefined);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.formContainer}>
        {/* Header */}
        <FormHeader label="CREATE ACCOUNT" />

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Name Input */}
          <Input
            label="Name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={handleNameChange}
            error={nameError}
            hasError={!!nameError}
          />

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

          {/* Confirm Password Input */}
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={confirmPasswordError}
            hasError={!!confirmPasswordError}
          />

          {/* Terms Acceptance */}
          <div className={styles.formOptions}>
            <Checkbox
              label="I accept the Terms of Service and Privacy Policy"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            className={styles.submitButton}
            disabled={!acceptTerms}
          >
            Create account
          </Button>

          {/* Alternative Registration Options */}
          <AlternativeOptions
            onSSOClick={() => console.log("SSO registration")}
            onMagicLinkClick={() => console.log("Magic link registration")}
          />

          {/* Footer Links */}
          <FormFooter
            mainLinkText="Already have an account? Sign in"
            mainLinkUrl="/signin"
            verticalLayout
          />
        </form>
      </div>
    </div>
  );
}
