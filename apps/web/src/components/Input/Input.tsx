import { type InputHTMLAttributes, forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Icon } from "../Icon";
import styles from "./Input.module.css";

/**
 * Input component props
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    /**
     * Label text for the input
     */
    label?: string;

    /**
     * Error message to display below the input
     */
    error?: string;

    /**
     * If true, input is in error state
     */
    hasError?: boolean;
}

/**
 * Input component with label and error message support
 *
 * @example
 * ```tsx
 * <Input label="Email" type="email" placeholder="you@domain.com" />
 * <Input label="Password" type="password" error="Minimum 8 characters" hasError />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        { label, error, hasError, className, id, type = "text", ...props },
        ref
    ) => {
        const generatedId = useId();
        const inputId = id ?? `input-${generatedId}`;
        const errorId = `${inputId}-error`;
        const isInvalid = hasError === true || Boolean(error);

        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === "password";
        const resolvedType = isPassword && showPassword ? "text" : type;

        return (
            <div className={styles.container}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                    </label>
                )}
                <div className={styles.inputWrapper}>
                    <input
                        ref={ref}
                        id={inputId}
                        type={resolvedType}
                        className={`${styles.input} ${isInvalid ? styles.inputError : ""} ${isPassword ? styles.hasToggle : ""} ${className ?? ""}`}
                        aria-invalid={isInvalid || undefined}
                        aria-describedby={error ? errorId : undefined}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            className={styles.toggle}
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                            aria-pressed={showPassword}
                            tabIndex={props.disabled ? -1 : 0}
                        >
                            <Icon
                                icon={showPassword ? EyeOff : Eye}
                                size="sm"
                            />
                        </button>
                    )}
                </div>
                {error && (
                    <span id={errorId} className={styles.error} role="alert">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
