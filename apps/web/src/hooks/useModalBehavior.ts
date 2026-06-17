import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Hook for managing modal behavior (Escape key, body scroll, focus).
 *
 * Handles:
 * - Closing the modal on Escape key press
 * - Preventing body scroll while the modal is open
 * - Moving focus into the modal on open, trapping Tab navigation inside it,
 *   and restoring focus to the previously focused element on close
 *
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback to close the modal
 * @returns A ref to attach to the modal container element so focus can be
 *   trapped within it. Attaching the ref is optional but required for the
 *   focus-management behaviour.
 *
 * @example
 * ```tsx
 * const modalRef = useModalBehavior(isOpen, onClose);
 * return <div ref={modalRef} role="dialog" aria-modal="true">…</div>;
 * ```
 */
export function useModalBehavior(
    isOpen: boolean,
    onClose: () => void
): RefObject<HTMLDivElement | null> {
    const containerRef = useRef<HTMLDivElement>(null);

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

    // Focus management: initial focus, focus trap, and focus restore
    useEffect(() => {
        if (!isOpen) return;
        const container = containerRef.current;
        if (!container) return;

        const previouslyFocused =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        const getFocusable = () =>
            Array.from(
                container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
            );

        // Move focus into the modal
        const focusable = getFocusable();
        if (focusable.length > 0) {
            focusable[0].focus();
        } else {
            container.setAttribute("tabindex", "-1");
            container.focus();
        }

        // Keep Tab navigation inside the modal
        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;

            const items = getFocusable();
            if (items.length === 0) {
                e.preventDefault();
                return;
            }

            const first = items[0];
            const last = items[items.length - 1];
            const active = document.activeElement;

            if (e.shiftKey) {
                if (active === first || !container.contains(active)) {
                    e.preventDefault();
                    last.focus();
                }
            } else if (active === last || !container.contains(active)) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleTab);
        return () => {
            document.removeEventListener("keydown", handleTab);
            previouslyFocused?.focus();
        };
    }, [isOpen]);

    return containerRef;
}
