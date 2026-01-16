import { Link } from "react-router-dom";
import { Button } from "../../../../../components/Button";
import { Input } from "../../../../../components/Input";
import { Checkbox } from "../../../../../components/Checkbox";
import { FormHeader, FormFooter } from "../../../components";
import { useLoginForm } from "../../../hooks";
import styles from "./LoginFormPanel.module.css";

/**
 * Login form panel component
 *
 * Displays the login form on the right side with email/password inputs,
 */
export function LoginFormPanel() {
    const { register, errors, isLoading, handleSubmit } = useLoginForm();

    return (
        <div className={styles.panel}>
            <div className={styles.formContainer}>
                {/* Header */}
                <FormHeader label="SIGN IN" />

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

                    {/* Remember Device & Forgot Password */}
                    <div className={styles.formOptions}>
                        <Checkbox
                            label="Remember this device"
                            {...register("rememberDevice")}
                        />
                        <Link
                            to="/forgot-password"
                            className={styles.forgotLink}
                        >
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
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Continue"}
                    </Button>

                    {/* Footer Links */}
                    <FormFooter
                        mainLinkText="New here? Create an account"
                        mainLinkUrl="/signup"
                    />
                </form>
            </div>
        </div>
    );
}
