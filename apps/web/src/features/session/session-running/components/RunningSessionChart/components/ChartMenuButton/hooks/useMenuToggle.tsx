import { useState, useEffect, useRef } from "react";

/**
 * Hook to manage menu toggle functionality with outside click detection
 *
 * @returns Menu state and handlers
 */
export function useMenuToggle() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
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

    return {
        isMenuOpen,
        menuRef,
        handleToggle,
    };
}
