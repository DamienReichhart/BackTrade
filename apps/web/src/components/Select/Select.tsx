import { useState, useEffect, useRef } from "react";
import styles from "./Select.module.css";
import type { SelectOption } from "../../types/ui";

/**
 * Select component props
 */
interface SelectProps {
    /**
     * Current selected value
     */
    value: string;

    /**
     * Options to display
     */
    options: SelectOption[];

    /**
     * Callback when value changes
     */
    onChange: (value: string) => void;

    /**
     * Placeholder text
     */
    placeholder?: string;

    /**
     * If true, select is disabled
     */
    disabled?: boolean;

    /**
     * Additional CSS class name
     */
    className?: string;
}

/**
 * Custom Select component
 *
 * A styled dropdown select that matches the application's dark theme
 */
export function Select({
    value,
    options,
    onChange,
    placeholder = "Select...",
    disabled = false,
    className,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    // Find the selected option label
    const selectedOption = options.find((opt) => opt.value === value);
    const displayValue = selectedOption?.label ?? placeholder;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    /**
     * Handle option selection
     */
    const handleSelect = (optionValue: string) => {
        if (optionValue !== value) {
            onChange(optionValue);
        }
        setIsOpen(false);
    };

    /**
     * Toggle menu open/close
     */
    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div
            ref={selectRef}
            className={`${styles.select} ${className ?? ""} ${
                isOpen ? styles.open : ""
            } ${disabled ? styles.disabled : ""}`}
        >
            <button
                type="button"
                className={styles.button}
                onClick={handleToggle}
                disabled={disabled}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className={styles.value}>{displayValue}</span>
                <svg
                    className={styles.arrow}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6 9L1 4h10L6 9z"
                        fill="currentColor"
                        fillOpacity="0.7"
                    />
                </svg>
            </button>
            {isOpen && (
                <div className={styles.menu} role="listbox">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`${styles.menuItem} ${
                                option.value === value
                                    ? styles.menuItemActive
                                    : ""
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSelect(option.value);
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                            }}
                            role="option"
                            aria-selected={option.value === value}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
