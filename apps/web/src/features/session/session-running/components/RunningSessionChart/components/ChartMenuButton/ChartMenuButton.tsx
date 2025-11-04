import { useState, useEffect, useRef } from "react";
import { ChartControls } from "../ChartControls";
import type { ChartGridSettings } from "../../../../../../../utils/localStorage";
import styles from "./ChartMenuButton.module.css";

/**
 * ChartMenuButton component props
 */
interface ChartMenuButtonProps {
  /**
   * Callback when grid settings change
   */
  onSettingsChange?: (settings: ChartGridSettings) => void;
}

/**
 * ChartMenuButton component
 *
 * Displays an icon button that opens a dropdown menu with chart configuration controls.
 * The menu appears in the top-left corner of the chart.
 */
export function ChartMenuButton({ onSettingsChange }: ChartMenuButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={styles.menuButton} ref={menuRef}>
      <button
        className={styles.button}
        onClick={handleToggle}
        aria-label="Chart settings"
        aria-expanded={isMenuOpen}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.icon}
        >
          <path
            d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.5 10C2.5 6.5 4.5 3.5 7.5 2.5M17.5 10C17.5 13.5 15.5 16.5 12.5 17.5M2.5 10C2.5 13.5 4.5 16.5 7.5 17.5M17.5 10C17.5 6.5 15.5 3.5 12.5 2.5M10 2.5C10 2.5 10 3.5 10 5C10 6.5 10 7.5 10 7.5M10 17.5C10 17.5 10 16.5 10 15C10 13.5 10 12.5 10 12.5M2.5 10C2.5 10 3.5 10 5 10C6.5 10 7.5 10 7.5 10M17.5 10C17.5 10 16.5 10 15 10C13.5 10 12.5 10 12.5 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isMenuOpen && (
        <div className={styles.menu}>
          <div className={styles.menuHeader}>
            <h3 className={styles.menuTitle}>Chart Settings</h3>
          </div>
          <div className={styles.menuContent}>
            <ChartControls onSettingsChange={onSettingsChange} />
          </div>
        </div>
      )}
    </div>
  );
}

