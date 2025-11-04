import styles from "./SpeedSelector.module.css";
import type { Speed } from "@backtrade/types";
import { useState, useEffect, useRef } from "react";
import { useUpdateSession } from "../../../../../../../../../api/requests/sessions";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentSessionStore } from "../../../../../../../../../context/CurrentSessionContext";

interface SpeedSelectorProps {
  /**
   * Callback when speed update fails
   */
  onError?: (error: string) => void;
  /**
   * Callback when speed update succeeds
   */
  onSuccess?: () => void;
}

/**
 * SpeedSelector component
 *
 * Displays a dropdown menu for selecting session playback speed
 */
export function SpeedSelector({ onError, onSuccess }: SpeedSelectorProps) {
  const { currentSession } = useCurrentSessionStore();
  const currentSpeed = currentSession?.speed ?? "1x";
  const sessionId = currentSession?.id?.toString();

  const queryClient = useQueryClient();
  const { execute: updateSession, isLoading: isUpdatingSpeed } =
    useUpdateSession(sessionId ?? "");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const availableSpeeds: Speed[] = [
    "0.5x",
    "1x",
    "2x",
    "3x",
    "5x",
    "10x",
    "15x",
  ];

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

  const handleSpeedSelect = async (speed: Speed) => {
    if (!sessionId) {
      onError?.("Session ID is required");
      return;
    }

    if (speed === currentSpeed) {
      setIsMenuOpen(false);
      return;
    }

    try {
      const updatedSession = await updateSession({ speed });

      // Update the session query cache with the mutation result
      queryClient.setQueryData(
        ["GET", `/sessions/${sessionId}`],
        updatedSession,
      );
      setIsMenuOpen(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update session speed";
      onError?.(errorMessage);
    }
  };

  return (
    <div className={styles.speedSelector} ref={menuRef}>
      <button
        className={styles.button}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        disabled={!sessionId || isUpdatingSpeed}
      >
        {isUpdatingSpeed ? "Updating..." : `Speed ${currentSpeed}`}
      </button>
      {isMenuOpen && (
        <div className={styles.menu}>
          {availableSpeeds.map((speed) => (
            <button
              key={speed}
              className={`${styles.menuItem} ${
                speed === currentSpeed ? styles.menuItemActive : ""
              }`}
              onClick={() => handleSpeedSelect(speed)}
            >
              {speed}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
