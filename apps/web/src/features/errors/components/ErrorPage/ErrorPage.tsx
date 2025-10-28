import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/Button";
import styles from "./ErrorPage.module.css";

/**
 * Error page configuration
 */
export interface ErrorPageConfig {
  /**
   * Error status code
   */
  statusCode: number;

  /**
   * Error title/heading
   */
  title: string;

  /**
   * Error description/subtitle
   */
  description: string;

  /**
   * Optional detailed message
   */
  details?: string;

  /**
   * Primary action button text
   * @default "Go Home"
   */
  primaryActionText?: string;

  /**
   * Primary action handler
   * @default navigate to home
   */
  primaryAction?: () => void;

  /**
   * Secondary action button text
   * @default undefined (hidden)
   */
  secondaryActionText?: string;

  /**
   * Secondary action handler
   */
  secondaryAction?: () => void;

  /**
   * Custom icon component
   */
  icon?: ReactNode;

  /**
   * Whether to show the status code
   * @default true
   */
  showStatusCode?: boolean;
}

/**
 * Props for ErrorPage component
 */
interface ErrorPageProps extends ErrorPageConfig {
  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Modular error page component that can be configured for different error types
 *
 * @example
 * ```tsx
 * <ErrorPage
 *   statusCode={404}
 *   title="Page Not Found"
 *   description="The page you're looking for doesn't exist."
 *   primaryActionText="Go Home"
 * />
 * ```
 */
export function ErrorPage({
  statusCode,
  title,
  description,
  details,
  primaryActionText = "Go Home",
  primaryAction,
  secondaryActionText,
  secondaryAction,
  icon,
  showStatusCode = true,
  className,
}: ErrorPageProps) {
  const navigate = useNavigate();

  const handlePrimaryAction = () => {
    if (primaryAction) {
      primaryAction();
    } else {
      navigate("/");
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className={`${styles.errorPage} ${className ?? ""}`}>
      <div className={styles.container}>
        {/* Icon Section */}
        {icon && <div className={styles.icon}>{icon}</div>}

        {/* Status Code */}
        {showStatusCode && (
          <div className={styles.statusCode}>{statusCode}</div>
        )}

        {/* Title */}
        <h1 className={styles.title}>{title}</h1>

        {/* Description */}
        <p className={styles.description}>{description}</p>

        {/* Details */}
        {details && <p className={styles.details}>{details}</p>}

        {/* Actions */}
        <div className={styles.actions}>
          <Button variant="primary" size="large" onClick={handlePrimaryAction}>
            {primaryActionText}
          </Button>
          {secondaryActionText && secondaryAction && (
            <Button variant="outline" size="large" onClick={secondaryAction}>
              {secondaryActionText}
            </Button>
          )}
          {!secondaryActionText && (
            <Button variant="ghost" size="large" onClick={handleGoBack}>
              Go Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
