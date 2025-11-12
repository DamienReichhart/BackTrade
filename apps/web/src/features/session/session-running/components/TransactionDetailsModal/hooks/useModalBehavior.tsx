import { useEffect } from "react";

/**
 * Hook to manage modal behavior (Escape key and body scroll)
 *
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback to close the modal
 */
export function useModalBehavior(isOpen: boolean, onClose: () => void) {
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
