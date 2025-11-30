import { type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.css";

/**
 * Button component variants
 */
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

/**
 * Button component sizes
 */
type ButtonSize = "small" | "medium" | "large";

/**
 * Button component props
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button content
   */
  children: ReactNode;

  /**
   * Visual variant of the button
   * @default "primary"
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @default "medium"
   */
  size?: ButtonSize;

  /**
   * If true, button takes full width of container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * If true, button is disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * Versatile button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="large">Get started</Button>
 * <Button variant="outline" onClick={handleClick}>Learn more</Button>
 * ```
 */
export function Button({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
