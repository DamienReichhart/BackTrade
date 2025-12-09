import { Link } from "react-router-dom";
import { Button } from "../../../../../components/Button";
import { Input } from "../../../../../components/Input";
import { Checkbox } from "../../../../../components/Checkbox";
import { FormHeader, FormFooter } from "../../../components";
import { useRegisterForm } from "../../../hooks";
import styles from "./RegisterFormPanel.module.css";

/**
 * Register form panel component
 *
 * Displays the registration form on the right side with name, email, password,
 * and terms acceptance fields
 */
export function RegisterFormPanel() {
    const {
        formState,
        errors,
        isLoading,
        isFormValid,
        handleEmailChange,
        handlePasswordChange,
        handleConfirmPasswordChange,
        handleAcceptTermsChange,
        handleSubmit,
    } = useRegisterForm();

    return (
        <div className={styles.panel}>
            <div className={styles.formContainer}>
                {/* Header */}
                <FormHeader label="CREATE ACCOUNT" />

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
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

                    {/* Password Input */}
                    <Input
                        label="Password"
                        type="password"
                        value={formState.password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        error={errors.password}
                        hasError={!!errors.password}
                    />

                    {/* Confirm Password Input */}
                    <Input
                        label="Confirm Password"
                        type="password"
                        value={formState.confirmPassword}
                        onChange={(e) =>
                            handleConfirmPasswordChange(e.target.value)
                        }
                        error={errors.confirmPassword}
                        hasError={!!errors.confirmPassword}
                    />

                    {/* Terms Acceptance */}
                    <div className={styles.formOptions}>
                        <Checkbox
                            label={
                                <>
                                    I accept the{" "}
                                    <Link
                                        to="/terms"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link
                                        to="/privacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Privacy Policy
                                    </Link>
                                </>
                            }
                            checked={formState.acceptTerms}
                            onChange={(e) =>
                                handleAcceptTermsChange(e.target.checked)
                            }
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        fullWidth
                        className={styles.submitButton}
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? "Creating account..." : "Create account"}
                    </Button>

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
