import { forwardRef, useId } from "react";
import styles from "./Toggle.module.css";

/**
 * Toggle component props
 */
interface ToggleProps {
  /**
   * Label text for the toggle
   */
  label?: string;

  /**
   * Whether the toggle is checked
   */
  checked?: boolean;

  /**
   * Whether the toggle is disabled
   */
  disabled?: boolean;

  /**
   * Callback fired when the toggle state changes
   */
  onChange?: (checked: boolean) => void;

  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Toggle switch component with label support
 *
 * @example
 * ```tsx
 * <Toggle label="Enable notifications" checked={enabled} onChange={setEnabled} />
 * <Toggle label="Two-factor authentication" />
 * ```
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, checked = false, disabled = false, onChange, className }, ref) => {
    const generatedId = useId();
    const toggleId = `toggle-${generatedId}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled && onChange) {
        onChange(e.target.checked);
      }
    };

    return (
      <div className={`${styles.container} ${className ?? ""}`}>
        <input
          ref={ref}
          id={toggleId}
          type="checkbox"
          className={styles.toggle}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
        />
        {label && (
          <label htmlFor={toggleId} className={styles.label}>
            {label}
          </label>
        )}
      </div>
    );
  },
);

Toggle.displayName = "Toggle";
