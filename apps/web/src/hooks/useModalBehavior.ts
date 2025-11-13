import { useEffect } from "react";

/**
 * Hook for managing modal behavior (Escape key, body scroll)
 *
 * Handles:
 * - Closing modal on Escape key press
 * - Preventing body scroll when modal is open
 *
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback to close the modal
 *
 * @example
 * ```tsx
 * useModalBehavior(isOpen, onClose);
 * ```
 */
export function useModalBehavior(isOpen: boolean, onClose: () => void): void {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
}
