import { Button } from "../../../../../components/Button";
import { Input } from "../../../../../components/Input";
import { FormHeader, FormFooter } from "../../../components";
import { useForgotPasswordForm } from "../../../hooks";
import styles from "./ForgotPasswordFormPanel.module.css";

/**
 * Forgot password form panel component
 *
 * Displays the forgot password form with two steps:
 * 1. Enter email to request reset code
 * 2. Enter code and new password to reset
 */
export function ForgotPasswordFormPanel() {
  const {
    step,
    formState,
    errors,
    isLoading,
    isStep1Valid,
    isStep2Valid,
    handleEmailChange,
    handleCodeChange,
    handleNewPasswordChange,
    handleStep1Submit,
    handleStep2Submit,
    handleBackToStep1,
  } = useForgotPasswordForm();

  return (
    <div className={styles.panel}>
      <div className={styles.formContainer}>
        {/* Header */}
        <FormHeader label={step === 1 ? "RESET PASSWORD" : "ENTER CODE"} />

        {/* Step 1: Email Request */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className={styles.form}>
            <p className={styles.description}>
              Enter your email address and we'll send you a verification code to
              reset your password.
            </p>

            {/* Email Input */}
            <Input
              label="Email"
              type="email"
              placeholder="you@domain.com"
              value={formState.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              error={errors.email}
              hasError={!!errors.email}
            />

            {/* General Error */}
            {errors.general && (
              <div className={styles.errorMessage}>{errors.general}</div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              className={styles.submitButton}
              disabled={isLoading || !isStep1Valid}
            >
              {isLoading ? "Sending..." : "Send Code"}
            </Button>

            {/* Footer Links */}
            <FormFooter
              mainLinkText="Remember your password? Sign in"
              mainLinkUrl="/signin"
            />
          </form>
        )}

        {/* Step 2: Code and New Password */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className={styles.form}>
            <p className={styles.description}>
              We've sent a verification code to {formState.email}. Enter the
              code and your new password below.
            </p>

            {/* Code Input */}
            <Input
              label="Verification Code"
              type="text"
              placeholder="Enter code"
              value={formState.code}
              onChange={(e) => handleCodeChange(e.target.value)}
              error={errors.code}
              hasError={!!errors.code}
            />

            {/* New Password Input */}
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={formState.newPassword}
              onChange={(e) => handleNewPasswordChange(e.target.value)}
              error={errors.newPassword}
              hasError={!!errors.newPassword}
            />

            {/* General Error */}
            {errors.general && (
              <div className={styles.errorMessage}>{errors.general}</div>
            )}

            {/* Back Button */}
            <Button
              type="button"
              variant="ghost"
              size="large"
              fullWidth
              onClick={handleBackToStep1}
              disabled={isLoading}
            >
              Back
            </Button>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              className={styles.submitButton}
              disabled={isLoading || !isStep2Valid}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>

            {/* Footer Links */}
            <FormFooter
              mainLinkText="Remember your password? Sign in"
              mainLinkUrl="/signin"
            />
          </form>
        )}
      </div>
    </div>
  );
}
