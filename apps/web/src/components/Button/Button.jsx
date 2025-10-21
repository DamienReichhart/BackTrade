import styles from "./Button.module.css";

/**
 * Versatile button component with multiple variants and sizes
 *
 * @example
 * ```jsx
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
}) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
