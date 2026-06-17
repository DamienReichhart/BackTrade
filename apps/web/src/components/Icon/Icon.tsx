import type { LucideIcon, LucideProps } from "lucide-react";

/**
 * Token-based icon sizes (px). Use these instead of arbitrary values to keep
 * icon rhythm consistent across the interface.
 */
export type IconSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<IconSize, number> = {
    sm: 16,
    md: 20,
    lg: 24,
};

interface IconProps extends Omit<LucideProps, "size" | "ref"> {
    /** The lucide-react icon component to render. */
    icon: LucideIcon;
    /**
     * Icon size. A token (`sm` = 16, `md` = 20, `lg` = 24) or an explicit pixel
     * value for one-off cases (e.g. large empty/error illustrations).
     * @default "md"
     */
    size?: IconSize | number;
    /**
     * Accessible label. When provided the icon is exposed to assistive tech as
     * an image with this label. When omitted the icon is treated as decorative
     * and hidden from screen readers — the surrounding control (e.g. an
     * icon-only button) should carry the label instead.
     */
    label?: string;
}

/**
 * Icon
 *
 * Thin wrapper around lucide-react icons enforcing a consistent size scale and
 * stroke width, plus correct accessibility semantics. Decorative by default;
 * pass `label` to expose it to screen readers.
 */
export function Icon({
    icon: IconComponent,
    size = "md",
    label,
    strokeWidth = 2,
    ...rest
}: IconProps) {
    const resolvedSize = typeof size === "number" ? size : SIZE_MAP[size];

    return (
        <IconComponent
            size={resolvedSize}
            strokeWidth={strokeWidth}
            aria-hidden={label ? undefined : true}
            aria-label={label}
            role={label ? "img" : undefined}
            focusable={false}
            {...rest}
        />
    );
}
