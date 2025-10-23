import { type InputHTMLAttributes, forwardRef, useId } from "react";
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
  ({ label, error, hasError, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;

    return (
      <div className={styles.container}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${styles.input} ${hasError ? styles.inputError : ""} ${className ?? ""}`}
          {...props}
        />
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
