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
    const { register, errors, isLoading, isValid, handleSubmit } =
        useRegisterForm();

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
                        error={errors.email?.message}
                        hasError={!!errors.email}
                        {...register("email")}
                    />

                    {/* Password Input */}
                    <Input
                        label="Password"
                        type="password"
                        error={errors.password?.message}
                        hasError={!!errors.password}
                        {...register("password")}
                    />

                    {/* Confirm Password Input */}
                    <Input
                        label="Confirm Password"
                        type="password"
                        error={errors.confirmPassword?.message}
                        hasError={!!errors.confirmPassword}
                        {...register("confirmPassword")}
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
                            {...register("acceptTerms")}
                        />
                        {errors.acceptTerms && (
                            <div className={styles.errorText}>
                                {errors.acceptTerms.message}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        fullWidth
                        className={styles.submitButton}
                        disabled={!isValid || isLoading}
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
