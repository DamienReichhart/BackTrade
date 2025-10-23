import { type InputHTMLAttributes, forwardRef, useId } from "react";
import styles from "./Checkbox.module.css";

/**
 * Checkbox component props
 */
interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /**
   * Label text for the checkbox
   */
  label?: string;
}

/**
 * Checkbox component with label support
 *
 * @example
 * ```tsx
 * <Checkbox label="Remember this device" />
 * <Checkbox label="I agree to terms" checked={agreed} onChange={handleChange} />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id ?? `checkbox-${generatedId}`;

    return (
      <div className={styles.container}>
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={`${styles.checkbox} ${className ?? ""}`}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className={styles.label}>
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
