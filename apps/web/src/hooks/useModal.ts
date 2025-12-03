import { useState, useCallback } from "react";

/**
 * Custom hook for managing modal state
 *
 * Provides a clean interface for opening/closing modals with an associated item.
 *
 * @template T - The type of item stored in the modal
 * @returns Modal state and control functions
 */
export function useModal<T = unknown>() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);

    /**
     * Open the modal with an item
     */
    const openModal = useCallback((item: T) => {
        setSelectedItem(item);
        setIsOpen(true);
    }, []);

    /**
     * Close the modal and clear the selected item
     */
    const closeModal = useCallback(() => {
        setIsOpen(false);
        setSelectedItem(null);
    }, []);

    return {
        isOpen,
        selectedItem,
        openModal,
        closeModal,
    };
}
