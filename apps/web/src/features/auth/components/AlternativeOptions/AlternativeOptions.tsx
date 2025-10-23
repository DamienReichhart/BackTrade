import { Button } from "../../../../components/Button";
import styles from "./AlternativeOptions.module.css";

interface AlternativeOptionsProps {
  /** Handler for SSO button click */
  onSSOClick?: () => void;
  /** Handler for Magic link button click */
  onMagicLinkClick?: () => void;
}

/**
 * Alternative options component
 *
 * Displays SSO and Magic link buttons as alternative authentication methods
 */
export function AlternativeOptions({
  onSSOClick,
  onMagicLinkClick,
}: AlternativeOptionsProps) {
  return (
    <>
      {/* Separator */}
      <div className={styles.separator}>
        <span>or</span>
      </div>

      {/* Alternative Options */}
      <div className={styles.alternativeOptions}>
        <Button
          type="button"
          variant="secondary"
          size="medium"
          onClick={onSSOClick}
        >
          SSO
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="medium"
          onClick={onMagicLinkClick}
        >
          Magic link
        </Button>
      </div>
    </>
  );
}
