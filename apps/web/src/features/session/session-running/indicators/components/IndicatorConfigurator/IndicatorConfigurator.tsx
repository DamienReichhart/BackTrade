import { useState } from "react";
import { IndicatorConfigModal } from "../IndicatorConfigModal";
import styles from "./IndicatorConfigurator.module.css";

/**
 * Launcher button for the indicator configuration modal
 */
export function IndicatorConfigurator() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        className={styles.button}
        onClick={openModal}
        aria-label="Indicator settings"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 3H5V15H3V3ZM8 6H10V15H8V6ZM13 9H15V15H13V9Z"
            fill="currentColor"
          />
        </svg>
        <span className={styles.label}>Indicators</span>
      </button>
      <IndicatorConfigModal isOpen={isOpen} onClose={closeModal} />
    </>
  );
}
